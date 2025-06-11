
import './App.css';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import LoginPage from './Authentication/Login';
import SignUpPage from './Authentication/SignUpPage';
import Forgetpassword from './Authentication/Forgetpassword';
import ConfirmEmailPage from './Authentication/ConfirmEmailPage';
import ResetPasswordPage from './Authentication/ResetPasswordPage';
import DashboardPage from './page/Dashboard';
import { CustomerForm } from './components/Customer-form';
import CustomersPage from './page/customers/Customerdata';
import AppLayout from './components/ui/layout/AppLayout';
import NewCustomerPage from './page/customers/Newcustomer/page';
import EditCustomerPage from './page/customers/Editcustomer/page';
import { Toaster } from './components/ui/Toaster';
import ItemRepositoryPage from './page/item-repository/Itemrepository';
import { RepositoryItemForm } from './components/RepositoryItemForm';
import NewRepositoryItemPage from './page/item-repository/Newitemrepository/page';
import EditRepositoryItemPage from './page/item-repository/Edititemrepository/page';



function App() {
  return (
<>
<Router>
  <Routes>
    <Route path='/' element={<LoginPage />}/>
    <Route path='/signup' element={<SignUpPage />}/>
    <Route path='/forget' element={<Forgetpassword />}/>
    <Route path='/confirm-email' element={<ConfirmEmailPage />}/>
    <Route path='/reset-password' element={<ResetPasswordPage />}/>
    <Route element={<AppLayout />}>
    <Route path='/dashboard' element={<DashboardPage />}/>
    <Route path='/customer-form' element={<CustomerForm />}/>
    <Route path='/Addcustomer' element={<NewCustomerPage />}/>
    <Route path='/customers' element={<CustomersPage />}/>
    <Route path='/customers/:id/edit' element={<EditCustomerPage />}/>
    <Route path='/item-repository' element={<ItemRepositoryPage/>}/>
    <Route path='/itemrepository-form' element={<RepositoryItemForm />}/>
    <Route path='/Additemrepository' element={<NewRepositoryItemPage/>}/>
    <Route path='/item-repository/:id/edit' element={<EditRepositoryItemPage/>}/>
    </Route>
    </Routes>
</Router>
<Toaster />
</>
  );
}

export default App;
