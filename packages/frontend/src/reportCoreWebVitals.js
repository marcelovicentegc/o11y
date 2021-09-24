const reportCoreWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getLCP }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getLCP(onPerfEntry);
    });
  }
};

export default reportCoreWebVitals;
