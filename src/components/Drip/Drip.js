import React from "react";

import SocialShare from "grommet/components/SocialShare";
import Menu from "grommet/components/Menu";
import Markdown from "grommet/components/Markdown";
import Header from "grommet/components/Header";
import Video from "grommet/components/Video";
import Box from "grommet/components/Box";
import Title from "grommet/components/Title";
import Sidebar from "grommet/components/Sidebar";
import Article from "grommet/components/Article";
import Section from "grommet/components/Section";
import Heading from "grommet/components/Heading";
import Paragraph from "grommet/components/Paragraph";
import Footer from "grommet/components/Footer";
import Logo from "grommet/components/icons/Grommet";
import DailyDripApi from "../../api/DailyDripApi";

export default class Drip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      content: "",
      videoURL: ""
    };
  }
  componentDidMount() {
    DailyDripApi.getDailyContent().then(response => {
      this.setState({
        title: response.title,
        content: response.description,
        videoURL: response.video
      });
    });
  }
  render() {
    const { title, content, videoURL } = this.state;
    return (
      <Article full={true} pad="none">
        <Header pad="medium" fixed={true}>
          <Title>{title}</Title>
          <Box flex={true} justify="end" direction="row" responsive={false}>
            <Menu inline={false}>
              <SocialShare
                text="Check out today's free video on DailyDrip!"
                link="http://www.dailydrip.com"
                type="twitter"
              />
              <SocialShare
                text="Check out today's free video on DailyDrip!"
                link="http://www.dailydrip.com"
                type="facebook"
              />
              <SocialShare
                text="Check out today's free video on DailyDrip!"
                link="http://www.dailydrip.com"
                type="email"
              />
            </Menu>
          </Box>
        </Header>
        <Section pad="none">
          <Video
            src={videoURL}
            allowFullScreen={true}
            fit="cover"
            title={title}
          />
        </Section>
        <Section pad="medium" />
        <Section pad="medium">
          <Markdown content={content} />
        </Section>
      </Article>
    );
  }
}
