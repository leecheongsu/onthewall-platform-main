const isMobile = () => {
  // check ipad, iphone, android
  // ipad
  if (navigator.userAgent.match(/iPad/i)) {
    return true;
  }
  // iphone
  if (navigator.userAgent.match(/iPhone/i)) {
    return true;
  }
  // android
  if (navigator.userAgent.match(/Android/i)) {
    return true;
  }
};
export default isMobile;
