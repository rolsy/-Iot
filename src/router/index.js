import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import PlanQuery from '@/components/PlanQuery'
import Plan from '@/components/Plan'
import Error from '@/components/Error'
import Calendar from '@/components/Calendar'
import Result from '@/components/Result'
import PlanLog from '@/components/PlanLog'
import Building from '@/components/Building'
import Floor from '@/components/Floor'
import Room from '@/components/Room'
import Point from '@/components/Point'
import Robot from '@/components/Robot'
import Permission from '@/components/Permission'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/PlanQuery',
      name: 'PlanQuery',
      component: PlanQuery,
      params:{}
    },
    {
      path: '/Plan',
      name: 'Plan',
      component: Plan
    },
    {
      path: '/Error',
      name: 'Error',
      component: Error
    },
    {
      path: '/Calendar',
      name: 'Calendar',
      component: Calendar
    },
    {
      path: '/Result',
      name: 'Result',
      component: Result
    },
    {
      path: '/PlanLog',
      name: 'PlanLog',
      component: PlanLog
    },
    {
      path: '/Building',
      name: 'Building',
      component: Building
    },
    {
      path: '/Floor',
      name: 'Floor',
      component: Floor
    },
    {
      path: '/Room',
      name: 'Room',
      component: Room
    },
    {
      path: '/Point',
      name: 'Point',
      component: Point
    },
    {
      path: '/Robot',
      name: 'Robot',
      component: Robot
    },
    {
      path: '/Permission',
      name: 'Permission',
      component: Permission
    }
  ]
})
