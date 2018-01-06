const { shallow, mount } = require('enzyme');
const React = require('react');
import PropTypes from 'prop-types';

const toHaveProp = require('../toHaveProp');

function User (props) {
  return (
    <div>
      {props.name}
      {props.email}
      {props.arrayProp}
      {props.objectProp.foo}
    </div>
  );
}

User.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  arrayProp: PropTypes.array,
  objectProp: PropTypes.object,
  falsy: PropTypes.bool,
};

const fn = () => {};

function Fixture () {
  return (
    <User
      name="blaine"
      email="blainekasten@gmail.com"
      arrayProp={[1, 2, 3]}
      objectProp={{ foo: 'bar' }}
      fn={fn}
      falsy={false}
    />
  );
}

/* eslint-disable max-nested-callbacks */
describe('toHaveProp', () => {
  [shallow, mount].forEach(builder => {
    describe(builder.name, () => {
      function build () {
        const wrapper = builder(<Fixture />);
        const user = wrapper.find(User);
        const truthyResults = toHaveProp(user, 'arrayProp', [1, 2, 3]);
        const falsyResults = toHaveProp(user, 'arrayProp', [4, 5, 6]);
        const noResults = toHaveProp(user, 'bingo', 'all the sixes');

        return {
          truthyResults,
          falsyResults,
          noResults,
        };
      }

      it('returns the pass flag properly', () => {
        const { truthyResults, falsyResults, noResults } = build();
        expect(truthyResults.pass).toBeTruthy();
        expect(falsyResults.pass).toBeFalsy();
        expect(noResults.pass).toBeFalsy();
      });

      it(`returns the message with the proper pass verbage (${builder.name})`, () => {
        const { truthyResults } = build();
        expect(truthyResults.message).toMatchSnapshot();
      });

      it(`returns the message with the proper fail verbage (${builder.name})`, () => {
        const { truthyResults } = build();
        expect(truthyResults.negatedMessage).toMatchSnapshot();
      });

      it(`provides contextual information for the message (${builder.name})`, () => {
        const { truthyResults } = build();
        expect(truthyResults.contextualInformation).toMatchSnapshot();
      });

      it('can validate arrays', () => {
        const wrapper = builder(<Fixture />);
        const user = wrapper.find(User);
        const truthy = toHaveProp(user, 'arrayProp', [1, 2, 3]);
        const falsy = toHaveProp(user, 'arrayProp', [4, 5, 6]);

        expect(truthy.pass).toBeTruthy();
        expect(falsy.pass).toBeFalsy();
      });

      it('can validate objects', () => {
        const wrapper = builder(<Fixture />);
        const user = wrapper.find(User);
        const truthy = toHaveProp(user, 'objectProp', { foo: 'bar' });
        const falsy = toHaveProp(user, 'objectProp', { foo: 'BOO' });

        expect(truthy.pass).toBeTruthy();
        expect(falsy.pass).toBeFalsy();
      });

      it('works with falsy props', () => {
        const wrapper = builder(<Fixture />);
        const { pass } = toHaveProp(wrapper.find(User), 'falsy', false);

        expect(pass).toBeTruthy();
      });

      it('works with functions', () => {
        const wrapper = builder(<Fixture />);
        const { pass } = toHaveProp(wrapper.find(User), 'fn', fn);
        const { pass: fail } = toHaveProp(wrapper.find(User), 'fn', () => {});

        expect(pass).toBeTruthy();
        expect(fail).toBeFalsy();
      });

      it('works without a prop value', () => {
        const wrapper = builder(<Fixture />);
        const truthy = toHaveProp(wrapper.find(User), 'name');

        expect(truthy.pass).toBeTruthy();
      });

      it('works with undefined value', () => {
        const wrapper = builder(<Fixture />);
        const falsy = toHaveProp(wrapper.find(User), 'name', undefined);

        expect(falsy.pass).toBeFalsy();
      });
    });
  });
});
/* eslint-enable max-nested-callbacks */
