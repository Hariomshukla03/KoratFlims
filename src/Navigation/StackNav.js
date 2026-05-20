import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../Components/Login';
import AdminDash from '../Components/AdminDash';
import PartyMas from '../Components/PartyMas';
import ItemMas from '../Components/ItemMas';
import ProdMas from '../Components/ProdMas';
import StaffMas from '../Components/StaffMas';
import Quotation from '../Components/Quotation';
import PartyAdd from '../Components/PartyCom/PartyAdd';
import PartyProfile from '../Components/PartyCom/PartyProfile';
import ItemForm from '../Components/ItemCom/ItemForm';
import ProductForm from '../Components/ProductCom/ProductForm';
import StaffProfile from '../Components/StaffComp/StaffProfile';
import StaffForm from '../Components/StaffComp/StaffForm';
import QuotationProfile from '../Components/QuotationCom/QuotationProfile';
import ProductDetails from '../Components/ProductCom/ProductDetails';
import ItemDetails from '../Components/ItemCom/ItemDeatils';
import QuotationForm from '../Components/QuotationCom/QuotationForm';
import QuotationDetailsForm from '../Components/QuotationCom/QuotationDetailsForm';
import Invoicehtml from '../Components/QuotationCom/ShowPDF';
import ShowPDF from '../Components/QuotationCom/ShowPDF';
import Pratice from '../Components/QuotationCom/Pratice';
import FinalBooking from '../Components/FinalBooking';
import BookingForm from '../Components/BookingCom/BookingForm';
import BookingProfile from '../Components/BookingCom/BookingProfile';
import BookingDetailForm from '../Components/BookingCom/BookingDetailForm';
import BookingStaff from '../Components/BookingStaff';
import ManageExpense from '../Components/ManageExpense';
import ExpenseForm from '../Components/ExpenseCom/ExpenseForm';
import BookingStaffForm from '../Components/BookingStaffCom/BookingStaffForm';
import Payment from '../Components/Payment';
import PaymentForm from '../Components/PaymentCom/PaymentForm';
import Package from '../Components/Package';
import PakageDetail from '../Components/PakageCom/PackageDetail';
import PackageDetails from '../Components/PakageCom/PackageDetail';
import PackageForm from '../Components/PakageCom/PackageForm';
import Sales from '../Components/Sales';
import SaleProfile from '../Components/SaleCom/SaleProfile';
import SaleForm from '../Components/SaleCom/SaleForm';
import SaleDetailForm from '../Components/SaleCom/SaleDetailForm';
import Appoinntment from '../Components/Appoinntment';
import AppointmentForm from '../Components/AppointmentCom/AppointmentForm';
import ExpenseReport from '../Components/ExpenseReport';
import QuotationFinalForm from '../Components/QuotationCom/QuotationFinalForm';
import BookingFinalForm from '../Components/BookingCom/BookingFinalForm';
import SaleFinalForm from '../Components/SaleCom/SaleFinalForm';
import IncomeEntry from '../Components/IncomeEntry';
import StaffPayment from '../Components/StaffPayment';
import StaffPaymentForm from '../Components/StaffPaymentCom/StaffPaymentForm';

const StackNav = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        name="LoginScreen"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DashboardScreen"
        component={AdminDash}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PartyScreen"
        component={PartyMas}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ItemScreen"
        component={ItemMas}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProdScreen"
        component={ProdMas}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StaffScreen"
        component={StaffMas}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="QuotationScreen"
        component={Quotation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PartyAddScreen"
        component={PartyAdd}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PartyProfileScreen"
        component={PartyProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ItemFormScreen"
        component={ItemForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ItemDetailsScreen"
        component={ItemDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProductFormScreen"
        component={ProductForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProductDetailsScreen"
        component={ProductDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StaffProfileScreen"
        component={StaffProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StaffFormScreen"
        component={StaffForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="QuotationProileScreen"
        component={QuotationProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="QuotationForm"
        component={QuotationForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="QuotationDetailForm"
        component={QuotationDetailsForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ShowPDF"
        component={ShowPDF}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Prac"
        component={Pratice}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="FinalBooking"
        component={FinalBooking}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BookingForm"
        component={BookingForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BookingProfileScreen"
        component={BookingProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BookingDetailForm"
        component={BookingDetailForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ManageExpense"
        component={ManageExpense}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ManageExpenseForm"
        component={ExpenseForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BookingStaff"
        component={BookingStaff}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BookingStaffForm"
        component={BookingStaffForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Payment"
        component={Payment}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PaymentForm"
        component={PaymentForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Package"
        component={Package}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PackageDetail"
        component={PackageDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PackageForm"
        component={PackageForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Sale"
        component={Sales}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SaleProfile"
        component={SaleProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SaleForm"
        component={SaleForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SaleDetailForm"
        component={SaleDetailForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Appointment"
        component={Appoinntment}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AppointmentForm"
        component={AppointmentForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ExpenseReport"
        component={ExpenseReport}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="QuotationFinalForm"
        component={QuotationFinalForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BookingFinalForm"
        component={BookingFinalForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SaleFinalForm"
        component={SaleFinalForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="IncomeEntry"
        component={IncomeEntry}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StaffPayment"
        component={StaffPayment}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StaffPaymentForm"
        component={StaffPaymentForm}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default StackNav;
