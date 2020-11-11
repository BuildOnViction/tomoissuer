import Login from './components/Login.vue'
import Home from './components/Home.vue'
import CreateToken from './components/applying/CreateToken.vue'
import VerifyContract from './components/applying/VerifyContract.vue'
import ConfirmToken from './components/applying/ConfirmToken.vue'
import TokenDetail from './components/Token.vue'
import DonateToken from './components/donate/DonateToken.vue'
import ConfirmDonate from './components/donate/ConfirmDonate.vue'
import TomoZCondition from './components/applytomo/TomoZCondition.vue'
import TomoZApplication from './components/applytomo/TomoZApplication.vue'
import TomoZConfirm from './components/applytomo/TomoZConfirm.vue'
import DepositFee from './components/deposit/DepositFee.vue'
import DepositConfirm from './components/deposit/DepositConfirm.vue'
import EditTransactionsFee from './components/edittransactionsfee/EditTransactionsFee.vue'
import EditTransactionsFeeConfirm from './components/edittransactionsfee/EditTransactionsFeeConfirm.vue'
import ReissueToken from './components/reissue/Reissue.vue'
import ReissueConfirm from './components/reissue/ReissueConfirm.vue'
import BurnToken from './components/burn/BurnToken.vue'
import BurnTokenConfirm from './components/burn/BurnTokenConfirm.vue'
import TomoXCondition from './components/applytomox/TomoXCondition.vue'
import TomoXConfirm from './components/applytomox/TomoXConfirm.vue'
import ViewToken from './components/ViewToken.vue'
import CreateBridgeToken from './components/applying/bridgeToken/CreateBridgeToken.vue'
import ConfirmBridgeToken from './components/applying/bridgeToken/ConfirmBridgeToken.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/confirmToken', component: ConfirmToken, name: 'ConfirmToken' },
    { path: '/createToken', component: CreateToken },
    { path: '/confirmBridgeToken', component: ConfirmBridgeToken, name: 'ConfirmBridgeToken' },
    { path: '/createBridgeToken', component: CreateBridgeToken },
    { path: '/verify', component: VerifyContract },
    { path: '/token/:address', component: TokenDetail },
    { path: '/donateTxFee', component: DonateToken },
    { path: '/confirmdonate/:address', component: ConfirmDonate, name: 'ConfirmDonate' },
    { path: '/tomozcondition/:address', component: TomoZCondition },
    { path: '/tomozapplication/:address', component: TomoZApplication },
    { path: '/tomozconfirm/:address', component: TomoZConfirm, name: 'TomoZConfirm' },
    { path: '/depositfee/:address', component: DepositFee },
    { path: '/depositconfirm/:address', component: DepositConfirm, name: 'DepositConfirm' },
    { path: '/edittransactionsfee/:address', component: EditTransactionsFee },
    { path: '/editconfirm/:address', component: EditTransactionsFeeConfirm, name: 'EditTransactionsFeeConfirm' },
    { path: '/reissueToken/:address', component: ReissueToken },
    { path: '/reissueTokenConfirm/:address', component: ReissueConfirm, name: 'ReissueConfirm' },
    { path: '/burnToken/:address', component: BurnToken },
    { path: '/burnTokenConfirm/:address', component: BurnTokenConfirm, name: 'BurnTokenConfirm' },
    { path: '/tomoxcondition/:address', component: TomoXCondition },
    { path: '/tomoxconfirm/:address', component: TomoXConfirm },
    { path: '/viewToken/:address', component: ViewToken }
]

export default routes
