function createElement({ tag, attributes, children }) {
  const el = document.createElement(tag);

  if (typeof children === 'string') {
    el.textContent = children;

    return el;
  }
  // debugger;
  // Assign attributes to element.
  if (Object.keys(attributes).length > 0) {
    Object.keys(attributes).forEach((key) => {
      const value = attributes[key];

      el.setAttribute(key, value);
    });
  }

  const childrenList = children.map((child) => createElement(child));
  childrenList.forEach((child) => {
    el.appendChild(child);
  });

  return el;
}

export default createElement;
