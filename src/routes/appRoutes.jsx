// src/routes/appRoutes.js
//
// Single source of truth for every gated page in the app.
// Add a new page here → it automatically:
//   1. Gets a <Route> in App.jsx
//   2. Syncs to the backend `app_modules` collection on next app load
//   3. Shows up in User Access Management's permission matrix
// No manual MongoDB inserts, no editing the RBAC backend.


// Module Syn logic
// Backend code : routes/moduleRoutes.js
// Frontend code : vt-web-portal/src/routes/appRoutes.jsx
// vt-web-portal/src/App.jsx and vt-web-portal/src/screens/useraccess-management.jsx
// To group routes by moduleGroup, use the moduleGroup property. This is just for organizing the permission matrix UI into sections. Use whatever category names make sense for your app.
// The name property is the display name for the route, and the path property is the URL path for the route. The moduleCode property is a unique identifier for the module, and it is used to sync the module with the backend. The component property is the React component that will be rendered when the route is accessed.

import Dashboard from '../screens/dashboard';
import Administration from '../screens/adminstration';
import BGVPlatform from '../screens/bgv-platform';
import MainLayout from '../screens/mainlayout';
import BGVDashboard from '../screens/bgv-dashboard';
import EmployeeCreation from '../employee-screens/employeecreation';
import ClientCreation from '../employee-screens/clientcreation';
import ClientDashboard from '../clientface/clientdashboard';
import ProfileOverlay from '../screens/profileoverlay';
import EmployeeBulkupload from '../employee-screens/employee-bulkupload';
import ClientBulkUpload from '../employee-screens/client-bulkupload';
import Vendorcreation from '../employee-screens/vendorcreation';
import VendorDashboard from '../vendorface/vendor-dashboard';
import CheckTypes from '../employee-screens/checktype-creation';
import Packages from '../employee-screens/package-creation';
import DocumentTypes from '../employee-screens/doctype-creation';
import Departments from '../employee-screens/department-creation';
import CompanyDirectory from '../employee-screens/companycreation-directory';
import Courts from '../employee-screens/court-creation';
import Universities from '../employee-screens/university-creation';
import CreateWorkorder from '../clientface/workorder-creation';
import WorkorderDashboard from '../clientface/workorder-dashboard';
import EmployeeWorkorderDashboard from '../employee-screens/workorder-cases-display';
import EmployeeWorkorderCreation from '../employee-screens/employeeface-workorder-creation';
import CustomFields from '../employee-screens/checktype-customfields';
import EmployeeAssignment from '../employee-screens/employeeface-client-workorder-assignment';
import UserAccessManagement from '../administration/useraccess-management';
import GroupsManagement from '../administration/groupmanagement';
import RolesAndPermissions from '../administration/roles-and-permissions';
import VerificationQueueScreen from '../employee-screens/verification-split';
import EmploymentVerificationVerifier from '../verifier-forms/employment-vform';
import AddressVerifierForm from '../verifier-forms/address-vform';
import EducationVerifierForm from '../verifier-forms/education-vform'; 
import DataManagement from '../DE/datamanagement';
import DataManagement2 from '../DE/datamanagement-completed';
import InsufficiencyManagement from '../DE/insufficiency-management';
import StoppedManagement from '../DE/stop-management';
import DummyTestModule from '../DE/dummyfile'; // Import the DummyTestModule component
import ClientStoppedManagement from '../clientface/client-stopped-management'; // Import the ClientStoppedManagement component
import ReportScreen from '../reports/report-screen'; // Import the ReportScreen component
import QCAssignmentTeam from '../QC/qc-assignment.jsx'; // Import the QCAssignmentTeam component
import QCMemberScreen from '../QC/qc-member.jsx'; // Import the QCMemberScreen component
import ReportDeliveryScreen from '../reports/reports-delivery.jsx'; // Import the ReportDeliveryScreen component
import CaseReviews from '../screens/casereviews.jsx';
import FieldVisits from '../screens/field-visits.jsx';

// e// moduleGroup is just for organizing the permission matrix UI into sections.
// Use whatever category names make sense for your app.
export const appRoutes = [
    { name: 'Dashboard', path: '/dashboard', moduleCode: 'dashboard', moduleGroup: 'Core', component: Dashboard },
    { name: 'Administration', path: '/administration', moduleCode: 'administration', moduleGroup: 'Administration', component: Administration },
    { name: 'BGV Platform', path: '/bgv-platform', moduleCode: 'bgv_platform', moduleGroup: 'Core', component: BGVPlatform },
    { name: 'Main Layout', path: '/mainlayout', moduleCode: 'mainlayout', moduleGroup: 'Core', component: MainLayout },
    { name: 'BGV Dashboard', path: '/bgv-dashboard', moduleCode: 'bgv_dashboard', moduleGroup: 'Operations', component: BGVDashboard },
    { name: 'Employee Creation', path: '/employee-creation', moduleCode: 'employee_creation', moduleGroup: 'Masters', component: EmployeeCreation },
    { name: 'Client Creation', path: '/client-creation', moduleCode: 'client_creation', moduleGroup: 'Masters', component: ClientCreation },
    { name: 'Client Dashboard', path: '/client-dashboard', moduleCode: 'client_dashboard', moduleGroup: 'Operations', component: ClientDashboard },
    { name: 'Profile Overlay', path: '/profile-overlay', moduleCode: 'profile_overlay', moduleGroup: 'Core', component: ProfileOverlay },
    { name: 'Employee Bulk Upload', path: '/employee-bulkupload', moduleCode: 'employee_bulkupload', moduleGroup: 'Masters', component: EmployeeBulkupload },
    { name: 'Client Bulk Upload', path: '/client-bulkupload', moduleCode: 'client_bulkupload', moduleGroup: 'Masters', component: ClientBulkUpload },
    { name: 'Vendor Creation', path: '/vendor-creation', moduleCode: 'vendor_creation', moduleGroup: 'Masters', component: Vendorcreation },
    { name: 'Vendor Dashboard', path: '/vendor-dashboard', moduleCode: 'vendor_dashboard', moduleGroup: 'Operations', component: VendorDashboard },
    { name: 'Check Types', path: '/checktype-creation', moduleCode: 'checktype_creation', moduleGroup: 'Masters', component: CheckTypes },
    { name: 'Packages', path: '/package-creation', moduleCode: 'package_creation', moduleGroup: 'Masters', component: Packages },
    { name: 'Document Types', path: '/documenttype-creation', moduleCode: 'documenttype_creation', moduleGroup: 'Masters', component: DocumentTypes },
    { name: 'Departments', path: '/department-creation', moduleCode: 'department_creation', moduleGroup: 'Masters', component: Departments },
    { name: 'Company Directory', path: '/company-directory', moduleCode: 'company_directory', moduleGroup: 'Masters', component: CompanyDirectory },
    { name: 'Courts', path: '/court-creation', moduleCode: 'court_creation', moduleGroup: 'Masters', component: Courts },
    { name: 'Universities', path: '/university-creation', moduleCode: 'university_creation', moduleGroup: 'Masters', component: Universities },
    { name: 'Workorder Creation', path: '/workorder-creation', moduleCode: 'workorder_creation', moduleGroup: 'Operations', component: CreateWorkorder },
    { name: 'Workorder Dashboard', path: '/workorder-dashboard', moduleCode: 'workorder_dashboard', moduleGroup: 'Operations', component: WorkorderDashboard },
    { name: 'Employee Workorder Dashboard', path: '/employee-workorder-dashboard', moduleCode: 'employee_workorder_dashboard', moduleGroup: 'Operations', component: EmployeeWorkorderDashboard },
    { name: 'Employee Workorder Creation', path: '/employee-workorder-creation', moduleCode: 'employee_workorder_creation', moduleGroup: 'Operations', component: EmployeeWorkorderCreation },
    { name: 'Check Type Custom Fields', path: '/checktype-customfields', moduleCode: 'checktype_customfields', moduleGroup: 'Masters', component: CustomFields },
    { name: 'Employee Assignment', path: '/employee-assignment', moduleCode: 'employee_assignment', moduleGroup: 'Operations', component: EmployeeAssignment },
    { name: 'User Access Management', path: '/user-access-management', moduleCode: 'useraccess_management', moduleGroup: 'Administration', component: UserAccessManagement },
    { name: 'Groups Management', path: '/groups-management', moduleCode: 'groups_management', moduleGroup: 'Administration', component: GroupsManagement },
    { name: 'Roles And Permissions', path: '/roles-and-permissions', moduleCode: 'roles_and_permissions', moduleGroup: 'Administration', component: RolesAndPermissions },
    { name: 'Data Management', path: '/data-management', moduleCode: 'data_management', moduleGroup: 'Administration', component: DataManagement },
    { name: 'Data Management Completed', path: '/data-management-completed', moduleCode: 'data_management_completed', moduleGroup: 'Administration', component: DataManagement2 },
    { name: 'Insufficiency Management', path: '/insufficiency-management', moduleCode: 'insufficiency_management', moduleGroup: 'Administration', component: InsufficiencyManagement },
    { name: 'Dummy Test Module', path: '/dummy-test-module', moduleCode: 'dummy_test_module', moduleGroup: 'Testing', component: DummyTestModule }, // Add the DummyTestModule route
    { name: 'Stopped Management', path: '/stop-management', moduleCode: 'stop_management', moduleGroup: 'Administration', component: StoppedManagement },
    { name: 'Client Stopped Management', path: '/client-stopped-management', moduleCode: 'client_stopped_management', moduleGroup: 'Administration', component: ClientStoppedManagement }, // Add the ClientStoppedManagement route
    { name: 'Reports', path: '/reports', moduleCode: 'reports', moduleGroup: 'Administration', component: ReportScreen }, // Add the Reports route
    { name: 'QC Assignment Team', path: '/qc-assignment-team', moduleCode: 'qc_assignment_team', moduleGroup: 'Quality Control', component: QCAssignmentTeam }, // Add the QCAssignmentTeam route
    { name: 'QC Member Screen', path: '/qc-member-screen', moduleCode: 'qc_member_screen', moduleGroup: 'Quality Control', component: QCMemberScreen }, // Add the QCMemberScreen route
    { name: 'Report Delivery Screen', path: '/report-delivery-screen', moduleCode: 'report_delivery_screen', moduleGroup: 'Reports', component: ReportDeliveryScreen }, // Add the ReportDeliveryScreen route
    { name: 'Case Reviews', path: '/casereviews', moduleCode: 'case_reviews', moduleGroup: 'Operations', component: CaseReviews },
    { name: 'Field Visits', path: '/field-visits', moduleCode: 'field_visits', moduleGroup: 'Operations', component: FieldVisits },
    // Per-check-type queue: 3 in-page tabs (Assignment Pending / Verification
    // Pending / Overall — scoped to THIS check type only).
    { name: 'Verification Queue', path: '/verifications/:checkTypeId/:stage', moduleCode: 'verification_queue', moduleGroup: 'Operations', component: VerificationQueueScreen },

    // NEW: global cross-check-type view ("All Verifications" card on the
    // dashboard). Same component, but with no :checkTypeId param — the
    // component detects this and switches to global mode with a
    // Verification Type filter covering every check type.
    { name: 'All Verifications', path: '/verifications-overall', moduleCode: 'verifications_overall', moduleGroup: 'Operations', component: VerificationQueueScreen },
    // Verifier form for Education Verification (Employment Verification is similar, but with a different form component). This is the actual form that the verifier fills out.
        { 
        name: 'Employment Verification Form', 
        path: '/verifier-forms/employment/:workorderId', 
        moduleCode: 'verifier_form_employment', 
        moduleGroup: 'Operations', 
        component: EmploymentVerificationVerifier, 
        icon: 'Briefcase',
        },
        { 
        name: 'Address Verification Form', 
        path: '/verifier-forms/address/:workorderId', 
        moduleCode: 'verifier_form_address', 
        moduleGroup: 'Operations', 
        component: AddressVerifierForm, 
        icon: 'Home',
        },
        {
        name: 'Education Verification Form',
        path: '/verifier-forms/education/:workorderId',
        moduleCode: 'verifier_form_education',
        moduleGroup: 'Operations',
        component: EducationVerifierForm,
        icon: 'GraduationCap',
        }
];

// Lightweight, serializable shape sent to /api/modules/sync — no component refs.
export const appRoutesPayload = appRoutes.map(({ name, path, moduleCode, moduleGroup }) => ({
    name,
    path,
    moduleCode,
    moduleGroup,
}));