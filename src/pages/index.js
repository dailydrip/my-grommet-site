import React from "react";
import Drip from "../components/Drip";
import Helmet from "react-helmet";

export default class Index extends React.Component {
  render() {
    return (
      <div>
        <Helmet title="DailyDrip - Some Episode" />
        <Drip />;
      </div>
    );
  }
}
