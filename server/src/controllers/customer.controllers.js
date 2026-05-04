import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Customer } from "../models/customer.models.js";

const createCustomer = async (result) => {
  try {
    // Create or find customer from collected data
    let customer = await Customer.findOne({ phone: result.data.phone });

    if (!customer) {
      const { name, phone, address } = result.data;
      // validate

      customer = await Customer.create({
        name,
        phone,
        address,
      });
    }

    // validate
  } catch (error) {
    console.log(error.message);
  }
};

export { createCustomer };
