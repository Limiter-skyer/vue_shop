import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, Container, Header, Main, Aside, Footer, Menu, MenuItem, Submenu, Breadcrumb, BreadcrumbItem, Card, Row, Col } from 'element-ui'
import { Table,TableColumn,Switch,Tooltip,Pagination,Dialog,MessageBox,Tag,Tree,Option,Select } from "element-ui";

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Footer)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Option)
Vue.use(Select)

Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$message = Message
