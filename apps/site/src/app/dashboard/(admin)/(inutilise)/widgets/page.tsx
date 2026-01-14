import React from 'react'
import { Col, Row } from 'react-bootstrap'
import Stats from './components/Stats';
import Statistic from './components/Statistic';
import ProjectSummary from './components/ProjectSummary';
import Schedules from './components/Schedules';
import Conversions from './components/Conversions';
import Tasks from './components/Tasks';
import FriendsRequest from './components/FriendsRequest';
import RecentTransactions from './components/RecentTransactions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const WidgetsPage = () => {
  return (
    <>
      <div>
        <Stats />
        <Statistic />
        <Row>
          <Col xl={6}>
            <ProjectSummary />
          </Col>
          <Col xl={6}>
            <Schedules />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Conversions />
          </Col>
        </Row>
        <Row>
          <Col xl={4}>
            <Tasks />
          </Col>
          <Col xl={4}>
            <FriendsRequest />
          </Col>
          <Col xl={4}>
            <RecentTransactions />
          </Col>
        </Row>
      </div>
    </>
  )
}

export default WidgetsPage
