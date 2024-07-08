const errorMidleWare = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "BACK END ERROR";
  const extraDetails = err.extraDetails || "ERROR FROM BACK END";

  return res.status(status).json({ message, extraDetails });
};
// console.log("errorMidleWare: ", errorMidleWare);

export default errorMidleWare;
