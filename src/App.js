
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
    <Route path='/branding-numbering' element={<BrandingPage />}/>
    <Route path='/term&condition' element={<TermsTemplatesPage />}/>
    <Route path='/termtempate-form' element={<TermsTemplateForm />}/>
    <Route path='/Addtermstemplate' element={<NewTermsTemplatePage />}/>
    <Route path='/term&condtion/:id/edit' element={<EditTermsTemplatePage />}/>
    <Route path='/coverpage' element={<CoverPageTemplatesPage />}/>
    <Route path='/coverpage-form' element={<CoverPageTemplateForm />}/>
    <Route path='/Addcoverpage' element={<NewCoverPageTemplatePage />}/>
    <Route path='/coverpage/:id/edit' element={<EditCoverPageTemplatePage />}/>
    <Route path='/msatemplate' element={<MsaTemplatesPage />}/>
    <Route path='/msatemplate-form' element={<MsaTemplateForm />}/>
    <Route path='/Addmsatemplate' element={<NewMsaTemplatePage />}/> 
    <Route path='/msatemp/:id/edit' element={<EditMsaTemplatePage />}/>
    </Route>
    </Routes>
</Router>
<Toaster />
</>
  );
}

export default App;
