import { PMS.WebPage } from './app.po';

describe('pms.web App', () => {
  let page: PMS.WebPage;

  beforeEach(() => {
    page = new PMS.WebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
