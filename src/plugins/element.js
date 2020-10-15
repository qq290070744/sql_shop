import Vue from 'vue'
import { Button } from 'element-ui'
import {Form} from "element-ui";
import {Card} from "element-ui";
import {Input} from "element-ui";
import {FormItem} from "element-ui";
import {Message} from "element-ui";
import {Container,Header,Aside,Main,Row,Col,Menu,MenuItem,Select,Submenu} from "element-ui";
import {Table,TableColumn} from "element-ui";
import {Breadcrumb,BreadcrumbItem} from "element-ui";
import {Pagination} from "element-ui";
import {Dialog} from "element-ui";
import {Loading} from "element-ui";
import {MessageBox} from "element-ui";
import {Tag} from "element-ui";
import {Checkbox} from "element-ui";
import {CheckboxGroup} from "element-ui";
import {Option} from "element-ui";
import {Radio} from "element-ui";
import {Switch} from "element-ui";
import {Collapse} from "element-ui";
import {CollapseItem} from "element-ui";
import {InfiniteScroll} from "element-ui";
import {Notification} from "element-ui";
import {Divider} from "element-ui";
import {Steps} from "element-ui";
import {Step} from "element-ui";
import {Avatar} from "element-ui"
import {Badge} from "element-ui"

Vue.use(Badge)
Vue.use(Avatar)
Vue.use(Step)
Vue.use(Steps)
Vue.use(Divider)
Vue.use(InfiniteScroll)
Vue.use(CollapseItem)
Vue.use(Collapse)
Vue.use(Switch)
Vue.use(Radio)
Vue.use(Option)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Tag)
Vue.use(Loading)
Vue.use(Dialog)
Vue.use(Pagination)
Vue.use(BreadcrumbItem)
Vue.use(Breadcrumb)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Submenu)
Vue.use(Select)
Vue.use(MenuItem)
Vue.use(Menu)
Vue.use(Col)
Vue.use(Row)
Vue.use(Button)
Vue.use(Form)
Vue.use(Input)
Vue.use(Card)
Vue.use(FormItem)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)

Vue.prototype.$notify=Notification
Vue.prototype.$message=Message
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
