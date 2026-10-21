/**
 * Kiểm tra parser không nhận Zestimate, nhà ngoài California, URL giả và trang bị chặn; giữ số phòng tắm lẻ và phân trang.
 * Dùng bởi: npm test -- zillow-parser --runInBand, không cần mạng hoặc database.
 */
import { parseZillowPage, validateZillowUrl } from './zillow-parser';

const listing = (overrides: Record<string, unknown> = {}) => ({
  zpid: '123', addressStreet: '123 Main St', addressCity: 'Irvine', addressState: 'CA',
  addressZipcode: '92612', unformattedPrice: 1250000, beds: 3, baths: 2.5, area: 1800,
  detailUrl: '/homedetails/123-Main-St/123_zpid/', imgSrc: 'https://photos.zillowstatic.com/fp/abc-p_e.jpg',
  hdpData: { homeInfo: { homeType: 'SINGLE_FAMILY', homeStatus: 'FOR_SALE', zestimate: 900000 } },
  ...overrides,
});

const htmlOf = (rows: unknown[], searchList: Record<string, unknown> = {}) => `<script type="application/json" id="__NEXT_DATA__">${JSON.stringify({
  props: { pageProps: { searchPageState: { cat1: { searchResults: { listResults: rows }, searchList } } } },
})}</script>`;

describe('Zillow listing parser', () => {
  test('giữ giá đăng bán, phòng tắm lẻ, ảnh và URL phân trang', () => {
    const page = parseZillowPage(htmlOf([listing()], { pagination: { nextUrl: '/ca/2_p/' }, totalResultCount: 5000, totalPages: 20, resultsPerPage: 40 }), 'https://www.zillow.com/ca/');
    expect(page.listings[0].data).toMatchObject({ price: 1250000, baths: 2.5, state: 'CA', source: 'zillow', region: 'orange-county' });
    expect(page.listings[0].data.images).toHaveLength(1);
    expect(page.nextUrl).toBe('https://www.zillow.com/ca/2_p/');
    expect(page.limitedBySource).toBe(true);
  });

  test('không nhận nhà ngoài CA, giá Zestimate, nhà đã bán hoặc loại nhà chưa hỗ trợ', () => {
    const page = parseZillowPage(htmlOf([
      listing({ addressState: 'TX' }), listing({ shouldShowZestimateAsPrice: true }),
      listing({ unformattedPrice: null }), listing({ hdpData: { homeInfo: { homeStatus: 'SOLD', homeType: 'SINGLE_FAMILY' } } }),
      listing({ hdpData: { homeInfo: { homeStatus: 'FOR_SALE', homeType: 'LOT' } } }),
    ]), 'https://www.zillow.com/ca/');
    expect(page.listings).toEqual([]);
    expect(page.skipped).toBe(5);
  });

  test('không biến dữ liệu thiếu thành thông số giả và chỉ giữ một mã Zillow', () => {
    const row = listing({ beds: null, baths: null, area: null, imgSrc: 'https://evil.example/image.jpg' });
    const page = parseZillowPage(htmlOf([row, row]), 'https://www.zillow.com/ca/');
    expect(page.listings).toHaveLength(1);
    expect(page.listings[0].data).not.toHaveProperty('beds');
    expect(page.listings[0].data).not.toHaveProperty('images');
  });

  test('đọc ảnh carousel định dạng mới và giới hạn 40 ảnh', () => {
    const row = listing({ carouselPhotosComposable: { baseUrl: 'https://photos.zillowstatic.com/fp/{photoKey}-p_e.jpg', photoData: Array.from({ length: 60 }, (_, index) => ({ photoKey: index.toString(16) })) } });
    expect(parseZillowPage(htmlOf([row]), 'https://www.zillow.com/ca/').listings[0].data.images).toHaveLength(40);
  });

  test('báo lỗi cấu trúc hoặc trang xác minh thay vì thành công với danh sách rỗng', () => {
    expect(() => parseZillowPage('<title>Human Verification</title>', 'https://www.zillow.com/ca/')).toThrow();
    expect(() => parseZillowPage('<script id="__NEXT_DATA__">{}</script>', 'https://www.zillow.com/ca/')).toThrow();
    expect(() => parseZillowPage('<script id="__NEXT_DATA__">invalid</script>', 'https://www.zillow.com/ca/')).toThrow();
  });

  test.each(['http://www.zillow.com/ca/', 'https://zillow.com.evil.example/', 'https://127.0.0.1/', 'https://user@www.zillow.com/', 'https://www.zillow.com:444/'])('từ chối URL không được phép: %s', (url) => {
    expect(() => validateZillowUrl(url)).toThrow();
  });

  test('không theo URL phân trang ra ngoài nguồn', () => {
    expect(() => parseZillowPage(htmlOf([], { pagination: { nextUrl: 'https://127.0.0.1/private' } }), 'https://www.zillow.com/ca/')).toThrow();
  });
});
