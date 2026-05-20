export const BASE_URL = 'https://koratfilms.editeffects.in/api/';

export const APIS = {
 
  LOGIN: `${BASE_URL}login.php`,

  PARTY_LIST: `${BASE_URL}party/list_party.php`,
  PARTY_DETAIL: `${BASE_URL}party/detail_party.php`,
  PARTY_ADD: `${BASE_URL}party/add_party.php`,
  PARTY_UPDATE: `${BASE_URL}party/update_party.php`,
  PARTY_DELETE: `${BASE_URL}party/delete_party.php`,
  PARTY_DETAIL: `${BASE_URL}party/detail_party.php`,

  PRODUCT_LIST: `${BASE_URL}product/list_product.php`,//-------------------------------------
  PRODUCT_ADD: `${BASE_URL}product/add_product.php`,              //Item Component mai use kia 
  PRODUCT_UPDATE: `${BASE_URL}product/update_product.php`,        // product api ko
  PRODUCT_DELETE: `${BASE_URL}product/delete_product.php`,//---------------------------------
  
  STAFF_LIST: BASE_URL + "staff/list_staff.php",
  STAFF_ADD: BASE_URL + "staff/add_staff.php",
  STAFF_DETAIL: BASE_URL + "staff/detail_staff.php",
  STAFF_UPDATE: BASE_URL + "staff/update_staff.php",
  STAFF_DELETE: BASE_URL + "staff/delete_staff.php",
  
  ADD_PROGRAM: BASE_URL + "program/add_event.php",//-----------------------------------------
  GET_PROGRAM: BASE_URL + "program/list_event.php",            //Product Component mai use kiya
  UPDATE_PROGRAM: BASE_URL + "program/update_event.php",      // program api ko
  DELETE_PROGRAM: BASE_URL + "program/delete_event.php",//--------------------------------
  
  GET_QUOTATION:BASE_URL+"quotation/list_quotation.php",
  ADD_QUOTATION:BASE_URL+"quotation/add_quotation.php",
  DELETE_QUOTATION: BASE_URL+"quotation/delete_quotation.php",
  DELETE_SINGLE_QUOTATION: BASE_URL+"quotation/delete_single_quotation.php",
  UPDATE_QUOTATION: BASE_URL+"quotation/update_quotation.php",
  UPDATE_SINGLE_QUOTATION: BASE_URL+"quotation/update_single_quotation.php",
  DETAILS_QUOTATION: BASE_URL+"quotation/detail_quotation.php",
  ADD_SINGLE_QUOTATION: BASE_URL+"quotation/add_single_quotation.php",
  
  GET_BOOKING:BASE_URL+"outdoor/list_outdoor.php",
  ADD_BOOKING:BASE_URL+"outdoor/add_outdoor.php",
  DELETE_BOOKING: BASE_URL+"outdoor/delete_outdoor.php",
  DELETE_SINGLE_BOOKING: BASE_URL+"outdoor/delete_single_outdoor.php",
  UPDATE_BOOKING: BASE_URL+"outdoor/update_outdoor.php",
  UPDATE_SINGLE_BOOKING: BASE_URL+"outdoor/update_single_outdoor.php",
  DETAILS_BOOKING: BASE_URL+"outdoor/detail_outdoor.php",
  ADD_SINGLE_BOOKING: BASE_URL+"outdoor/add_single_outdoor.php",
  ADD_BOOKING_QUOTATION_WISE:BASE_URL+"outdoor/add_outdoor_quotation_wise.php",
  
  ADD_EXPENSE:BASE_URL+"income_expense/add_income_expense.php",
  DELETE_EXPENSE: BASE_URL+"income_expense/delete_income_expense.php",
  UPDATE_EXPENSE: BASE_URL+"income_expense/update_income_expense.php",
  GET_EXPENSE: BASE_URL+"income_expense/list_income_expense.php",

  GET_BOOKING_STAFF:BASE_URL+"outdoor_staff_assign/list_staff_assign.php",
  ADD_BOOKING_STAFF:BASE_URL+"outdoor_staff_assign/add_staff_assign.php",
  UPDATE_BOOKING_STAFF:BASE_URL+"outdoor_staff_assign/update_staff_assign.php",
  DELETE_BOOKING_STAFF:BASE_URL+"outdoor_staff_assign/delete_staff_assign.php",

  GET_PAYMENT:BASE_URL+"outdoor_payment/list_outdoor_payment.php",
  ADD_PAYMENT:BASE_URL+"outdoor_payment/add_outdoor_payment.php",
  UPDATE_PAYMENT:BASE_URL+"outdoor_payment/update_outdoor_payment.php",
  DELETE_PAYMENT:BASE_URL+"outdoor_payment/delete_outdoor_payment.php",

  GET_PACKAGE:BASE_URL+"package/list_package.php",
  ADD_PACKAGE:BASE_URL+"package/add_package.php",
  DELETE_PACKAGE: BASE_URL+"package/delete_package.php",
  DELETE_SINGLE_PACKAGE: BASE_URL+"package/delete_single_package.php",
  UPDATE_PACKAGE: BASE_URL+"package/update_package_name.php",
  UPDATE_SINGLE_PACKAGE: BASE_URL+"package/update_single_package.php",
  DETAILS_PACKAGE: BASE_URL+"package/detail_package.php",
  ADD_SINGLE_PACKAGE: BASE_URL+"package/add_single_package.php",

  GET_SALE:BASE_URL+"sale_bill/list_sale_bill.php",
  ADD_SALE:BASE_URL+"sale_bill/add_sale_bill.php",
  DELETE_SALE: BASE_URL+"sale_bill/delete_sale_bill.php",
  DELETE_SINGLE_SALE: BASE_URL+"sale_bill/delete_single_sale_bill.php",
  UPDATE_SALE: BASE_URL+"sale_bill/update_sale_bill.php",
  UPDATE_SINGLE_SALE: BASE_URL+"sale_bill/update_single_sale_bill.php",
  DETAILS_SALE: BASE_URL+"sale_bill/detail_sale_bill.php",
  ADD_SINGLE_SALE: BASE_URL+"sale_bill/add_single_sale_bill.php",
  
  



  
  
};
