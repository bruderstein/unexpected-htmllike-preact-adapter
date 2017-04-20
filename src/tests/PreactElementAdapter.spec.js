import Preact, { h, Component } from 'preact';
import PreactElementAdapter from '../PreactElementAdapter';
import unexpected from 'unexpected';
import Immutable from 'immutable';

const expect = unexpected.clone();

function StatelessComp({ className }) {
  return <div className="className">foo</div>;
}

class ES6Comp extends Component {
  render() {
    return <div>es6</div>
  }
}

class ES6CompWithDisplayName extends Component {

  render() {
    return <div>es6</div>
  }
}
ES6CompWithDisplayName.displayName = 'ES6Display';


describe('PreactElementAdapter', function () {

  let adapter;
  beforeEach(function () {
    adapter = new PreactElementAdapter();
  });

  describe('getName', function () {

  it('gets the name of a native element', function () {
    expect(adapter.getName(<div />), 'to equal', 'div')
  });

  it('gets the name of a stateless component element', function () {
    expect(adapter.getName(<StatelessComp />), 'to equal', 'StatelessComp')
  });

  it('gets the name of a ES6 component element', function () {
    expect(adapter.getName(<ES6Comp />), 'to equal', 'ES6Comp')
  });

  it('gets the name of a ES6 component element with a displayName', function () {
    expect(adapter.getName(<ES6CompWithDisplayName />), 'to equal', 'ES6Display')
  });
  });

  describe('getAttributes', function () {

    it('gets empty set of attributes', function () {
      expect(adapter.getAttributes(<div />), 'to equal', {});
    });

    it('gets the attributes from a native element', function () {
      expect(adapter.getAttributes(<div className="foo" />), 'to equal', { class: 'foo' })
    });

    it('does not include the children prop', function () {
      expect(adapter.getAttributes(<div className="foo">bar</div>), 'to equal', { class: 'foo' })
    });

    it('does not include the key without the explicit option', function () {
      expect(<div key="123" />, 'to satisfy', { attributes: { key: '123' } })
      expect(adapter.getAttributes(<div key="123" className="foo">bar</div>),
        'to equal',
        { class: 'foo' }
      );
    });

    it('includes the key if includeKey is specified in the options', function () {
      adapter = new PreactElementAdapter({ includeKeyProp: true });
      expect(adapter.getAttributes(<div key="123" className="foo">bar</div>),
        'to equal',
        { class: 'foo', key: '123' }
      );
    });

    // TODO: ref specs (need to check how refs are supported in preact)
  });

  describe('getChildren', function () {

    it('returns an empty array for no children', function () {

      expect(adapter.getChildren(<div />), 'to equal', []);
    });

    it('returns a single child string', function () {
      expect(adapter.getChildren(<div>foo</div>), 'to equal', [ 'foo' ])
    });

    it('returns a single child number', function () {
      expect(adapter.getChildren(<div>{42}</div>), 'to equal', [ '42' ]);
    });

    it('returns a single child element', function () {
      expect(adapter.getChildren(<div><span /></div>), 'to equal', [ <span /> ])
    });

    it('returns multiple child elements', function () {
      expect(adapter.getChildren(<div><span /><aside /></div>), 'to equal', [ <span />, <aside /> ])
    });

    it('returns a multiple child values', function () {
      expect(adapter.getChildren(<div>{42}{'hello'}</div>), 'to equal', [ '42hello' ]);
    });

    it('returns mixed content', function () {
      expect(adapter.getChildren(<div>{42}<span>hello</span></div>), 'to equal', [ '42', <span>hello</span> ]);
    });

    it('returns array children', function () {
      const array = [ <span key="1">a</span>, <span key="2">b</span> ];
      expect(adapter.getChildren(<div>{array}</div>), 'to equal', [ <span key="1">a</span>, <span key="2">b</span> ]);
    });

    it('returns nested array children', function () {
      const nested = [ <div key="c">c</div>, <div key="d">d</div> ]
      const array = [ <span key="1">a</span>, nested, <span key="2">b</span> ];
      expect(adapter.getChildren(<div>{array}</div>), 'to equal', [
        <span key="1">a</span>,
        <div key="c">c</div>,
        <div key="d">d</div>,
        <span key="2">b</span>
      ]);
    });

    it('returns nested array children', function () {
      const nested = [ <div key="c">c</div>, <div key="d">d</div> ]
      const array = [ <span key="1">a</span>, nested, <span key="2">b</span> ];
      expect(adapter.getChildren(<div>{array}</div>), 'to equal', [
        <span key="1">a</span>,
        <div key="c">c</div>,
        <div key="d">d</div>,
        <span key="2">b</span>
      ]);
    });

    it('returns the expect.it function for an expect.it content assertion', () => {

      const component = <span>{expect.it('to be a string')}</span>;
      expect(adapter.getChildren(component), 'to satisfy', [ expect.it('to be a function') ]);
    });

    it.skip('returns the children from an iterator', () => {
      // Skipped because preact doesn't support this yet
      // See https://github.com/developit/preact/pull/476

      // Use an immutable.js List as an iterator
      const list = Immutable.List([ <span>one</span>, <span>two</span>, <span>three</span>]);

      const component = <span>{list}</span>;
      expect(component.children, 'to equal', [
        <span>one</span>,
        <span>two</span>,
        <span>three</span>
      ]);
    });
  });

  describe('render', function () {

  });
});
