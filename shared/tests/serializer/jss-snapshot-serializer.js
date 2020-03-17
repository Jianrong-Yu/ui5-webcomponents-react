const MARKER = '__jss-snapshot-serializer-marker__';

const jssClassNameRegexp = /([a-zA-Z0-9]*)-([a-zA-Z0-9]*)-([0-9]*)-([0-9]*)-([0-9]*)/;

const collectElements = (element, elements = []) => {
  if (typeof element !== 'object') {
    return elements;
  }

  elements.push(element);

  if (element.children) {
    element.children.forEach((child) => collectElements(child, elements));
  }

  return elements;
};

const markElements = (nodes) =>
  nodes.forEach((element) => {
    element[MARKER] = true;
  });

const replaceJssClassNames = (elements) => {
  elements.forEach((element) => {
    if (!element.props || (!element.props.className && !element.props.class)) return;

    const propForClassName = element.props.className ? 'className' : 'class';

    // JSS generates the class names that follow this format:
    // {componentName}-{ruleName}-{jssCounter}-{ruleCounter}
    // the non-deterministic part of it is "-{jssCounter}-{ruleCounter}"
    // so we simply remove from the snapshots
    const classNameProp = element.props[propForClassName];

    if (!classNameProp) return;

    const deterministicClassNames = (classNameProp.trim ? classNameProp : classNameProp.valueOf())
      .trim()
      .split(/\s+/)
      .map((className) => {
        // do not modify the className if it is not generated by JSS
        if (!jssClassNameRegexp.test(className)) return className;

        const lastDashPosition = className.lastIndexOf('-');
        const secondLastDashPosition = className.lastIndexOf('-', lastDashPosition - 1);

        return className.substring(0, secondLastDashPosition);
      });

    element.props[propForClassName] = deterministicClassNames.join(' ');
  });
};

module.exports = {
  test(value) {
    // apply the serializer only to react elements that we haven't marked(processed) before
    return value && !value[MARKER] && value.$$typeof === Symbol.for('react.test.json');
  },

  print(value, serialize) {
    // collect all react element nodes in the tree of the value
    const elements = collectElements(value);

    // mark the collected element nodes to avoid processing them several times
    markElements(elements);

    // remove the non-deterministic part from the JSS class names
    // to keep the snapshots repeatable
    replaceJssClassNames(elements);

    return serialize(value);
  }
};
