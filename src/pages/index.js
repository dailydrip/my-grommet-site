import React from "react";
import Drip from "../components/Drip";
import Helmet from "react-helmet";

export default class Index extends React.Component {
  render() {
    return (
      <div>
        <Helmet>
          <title>DailyDrip - Be a better developer</title>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="../../favicons/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="../../favicons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="../../favicons/favicon-16x16.png"
          />
        </Helmet>
        <Drip />;
      </div>
    );
  }
}
