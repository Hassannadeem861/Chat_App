const validate = (schema) => async (req, res, next) => {
  try {
    const parseBody = await schema.parseAsync(req.body);
    req.body = parseBody;
    next();
    console.log("parseBody: ", parseBody);
  } catch (err) {
    console.log("err: ", err);
    const status = 422;
    const message = "Fill the input correctly";
    const extraDetails = err.errors[0].message;

    const error = {
      status,
      message,
      extraDetails,
    };
    next(error);
    console.log("error: ", error);
    // console.log("message: ", message);
    // res.status(400).json({ message: message });
  }
};
// console.log("validate: ", validate);

export default validate;
