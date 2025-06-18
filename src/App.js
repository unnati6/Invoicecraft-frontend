
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
import BrandingPage from './page/branding/Page';
import TermsTemplatesPage from './page/templates/Terms & condtion/terms&condition';
import { TermsTemplateForm } from './components/terms-template-form';
import NewTermsTemplatePage from './page/templates/Terms & condtion/Newterms$condition/page';
import EditTermsTemplatePage from './page/templates/Terms & condtion/Editterms&condition/page.';
import CoverPageTemplatesPage from './page/templates/Coverpages/Coverpage';
import { CoverPageTemplateForm } from './components/coverpage-template-form';
import NewCoverPageTemplatePage from './page/templates/Coverpages/Newcoverpage/page';
import EditCoverPageTemplatePage from './page/templates/Coverpages/Editcoverpage/page';
import MsaTemplatesPage from './page/templates/Msa Templates/Msatemplates';
import { MsaTemplateForm } from './components/msa-template-form';
import NewMsaTemplatePage from './page/templates/Msa Templates/Newmsatemplate/page';
import EditMsaTemplatePage from './page/templates/Msa Templates/Editmsatemplate/page';
import { LogoutButton } from './Authentication/Logout';
import ProtectedRoute from './lib/ProtectedRoute';
import OrderFormsPage from './page/order-forms/Orderform';
import NewOrderFormPage from './page/order-forms/Neworderform/page';
import { OrderFormForm } from './components/orderform-form';
import EditOrderFormPage from './page/order-forms/Editorderform/page';

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
    <Route path='/logout' element={<LogoutButton />}/>
    <Route element={<AppLayout />}>
    <Route path='/dashboard' element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>
    <Route path='/customer-form' element={<ProtectedRoute><CustomerForm /></ProtectedRoute>}/>
    <Route path='/Addcustomer' element={<ProtectedRoute><NewCustomerPage /></ProtectedRoute>}/>
    <Route path='/customers' element={<ProtectedRoute><CustomersPage /></ProtectedRoute>}/>
    <Route path='/customers/:id/edit' element={<ProtectedRoute><EditCustomerPage /></ProtectedRoute>}/>
    <Route path='/item-repository' element={<ProtectedRoute><ItemRepositoryPage/></ProtectedRoute>}/>
    <Route path='/itemrepository-form' element={<ProtectedRoute><RepositoryItemForm /></ProtectedRoute>}/>
    <Route path='/Additemrepository' element={<ProtectedRoute><NewRepositoryItemPage/></ProtectedRoute>}/>
    <Route path='/item-repository/:id/edit' element={<ProtectedRoute><EditRepositoryItemPage/></ProtectedRoute>}/>
    <Route path='/branding-numbering' element={<ProtectedRoute><BrandingPage /></ProtectedRoute>}/>
    <Route path='/term&condition' element={<ProtectedRoute><TermsTemplatesPage /></ProtectedRoute>}/>
    <Route path='/termtempate-form' element={<ProtectedRoute><TermsTemplateForm /></ProtectedRoute>}/>
    <Route path='/Addtermstemplate' element={<ProtectedRoute><NewTermsTemplatePage /></ProtectedRoute>}/>
    <Route path='/term&condtion/:id/edit' element={<ProtectedRoute><EditTermsTemplatePage /></ProtectedRoute>}/>
    <Route path='/coverpage' element={<ProtectedRoute><CoverPageTemplatesPage /></ProtectedRoute>}/>
    <Route path='/coverpage-form' element={<ProtectedRoute><CoverPageTemplateForm /></ProtectedRoute>}/>
    <Route path='/Addcoverpage' element={<ProtectedRoute><NewCoverPageTemplatePage /></ProtectedRoute>}/>
    <Route path='/coverpage/:id/edit' element={<ProtectedRoute><EditCoverPageTemplatePage /></ProtectedRoute>}/>
    <Route path='/msatemplate' element={<ProtectedRoute><MsaTemplatesPage /></ProtectedRoute>}/>
    <Route path='/msatemplate-form' element={<ProtectedRoute><MsaTemplateForm /></ProtectedRoute>}/>
    <Route path='/Addmsatemplate' element={<ProtectedRoute><NewMsaTemplatePage /></ProtectedRoute>}/> 
    <Route path='/msatemp/:id/edit' element={<ProtectedRoute><EditMsaTemplatePage /></ProtectedRoute>}/>
    <Route path='/order-forms'element={<ProtectedRoute><OrderFormsPage /></ProtectedRoute>}/>
    <Route path='/Addorderform' element={<ProtectedRoute><NewOrderFormPage /></ProtectedRoute>}/>
    <Route path='/orderform-form' element={<ProtectedRoute><OrderFormForm /></ProtectedRoute>}/>
    <Route path='/Editorderform/:id/edit' element={<ProtectedRoute><EditOrderFormPage /></ProtectedRoute>}/>
     </Route>
    </Routes>
</Router>
<Toaster />
</>
  );
}

export default App;
