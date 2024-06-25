const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const ExpressError = require("../errorHandlers/expressError");
const { prepareUpdateQuery, createToken } = require("./functions");

describe("Helper Functions", () => {
  describe("prepareUpdateQuery", () => {
    it("should prepare update query correctly", () => {
      const dataToUpdate = {
        firstName: "John",
        zipCode: 12345,
        email: "john@mail.com",
      };
      const jsToSql = {
        firstName: "first_name",
        zipCode: "zip_code",
      };

      const result = prepareUpdateQuery(dataToUpdate, jsToSql);

      expect(result).toEqual({
        setColumns: '"first_name"=$1, "zip_code"=$2, "email"=$3',
        values: ["John", 12345, "john@mail.com"],
      });
    });

    it("should handle fields not in jsToSql", () => {
      const dataToUpdate = {
        username: "johndoe",
        age: 30,
      };
      const jsToSql = {};

      const result = prepareUpdateQuery(dataToUpdate, jsToSql);

      expect(result).toEqual({
        setColumns: '"username"=$1, "age"=$2',
        values: ["johndoe", 30],
      });
    });

    it("should throw an error if no data is provided", () => {
      expect(() => prepareUpdateQuery({}, {})).toThrow(ExpressError);
    });
  });

  describe("createToken", () => {
    it("should create a valid JWT token", () => {
      const user = {
        id: 1,
        username: "testuser",
        isAdmin: true,
      };

      const token = createToken(user);
      const decoded = jwt.verify(token, SECRET_KEY);

      expect(decoded).toEqual({
        id: 1,
        username: "testuser",
        isAdmin: true,
        iat: expect.any(Number),
      });
    });

    it("should set isAdmin to false if not provided", () => {
      const user = {
        id: 2,
        username: "regularuser",
      };

      const token = createToken(user);
      const decoded = jwt.verify(token, SECRET_KEY);

      expect(decoded).toEqual({
        id: 2,
        username: "regularuser",
        isAdmin: false,
        iat: expect.any(Number),
      });
    });
  });
});
