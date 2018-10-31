import React, { Component } from 'react';
import App from 'grommet/components/App';
import Columns from 'grommet/components/Columns';
import Box from 'grommet/components/Box';
import SearchInput from 'grommet/components/SearchInput';
import Card from 'grommet/components/Card';
import Anchor from 'grommet/components/Anchor';
import PlayFillIcon from 'grommet/components/icons/base/PlayFill';
import Select from 'grommet/components/Select';
import Header from 'grommet/components/Header';
import Animate from 'grommet/components/Animate';
import axios from 'axios';
import '../node_modules/grommet-css';
import './App.css';

const API_KEY = "AIzaSyCvtEWSyvX8hQ0vQv8xaHa9r1DJg9JYlyE"
const ROOT_URL = "https://www.googleapis.com/youtube/v3/search"

function searchYouTube(params, callback) {
  if (!params.key) {
    throw new Error('Please provide a API key parameter');
  }
  if(!params.part){
      params.part = 'snippet';
  }
  if(!params.maxResults){
      params.maxResults = 5;
  }
  if(!params.type){
      params.type = 'video';
  }
  axios.get(ROOT_URL, { params: params })
    .then(function(response) {
      if (callback) { callback(response.data.items); }
    })
    .catch(function(error) {
      console.error(error);
    });
};

function CardComponent(props) {
  const video = props.video;
  const url = `http://youtube.com/watch?v=${video.id}`;
  const description = `Published on ${new Date(video.date).toLocaleString()}`;
  return (
    <Animate key={video.id} enter={{"animation": "fade", "duration": 600, "delay": 300}} keep={true}>
      <Card
        key={video.id}
        thumbnail={video.thumb}
        textSize="small"
        heading={video.title}
        description={description}
        link={<Anchor href={url}
        primary={true}
        label='Watch the video'
        icon={<PlayFillIcon />}
        animateIcon={true} />}
        className="videoCard"
      />
    </Animate>
  )  
}

function compareName(a, b) {
  const nameA = a.title.toLowerCase(), nameB = b.title.toLowerCase();
  if (nameA < nameB)
    return -1;
  if (nameA > nameB)
    return 1;
  return 0;
}

function compareDate(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

class ReactApp extends Component {
  constructor(props) {
    super(props);
    this.searchYT = this.searchYT.bind(this);
    this.sortVideos = this.sortVideos.bind(this);
    this.state = {
      videos: [],
      sortKey: undefined
    }
  }
  processVideos(videos) {
    let v = []
    videos.forEach(video => {
      v.push({
        id: video.id.videoId,
        description: video.snippet.description,
        thumb: video.snippet.thumbnails.medium.url,
        title: video.snippet.title,
        date: video.snippet.publishedAt
      });
    });
    return v;
  }
  sortVideos(e) {
    if (e.value === 'Name' || e.value === 'Published Date') {
      this.setState({ sortKey: e.value });
    }
    // console.log(this.state.videos);
    if (e.value === 'Name') {
      const videos = this.state.videos;
      videos.sort(compareName);
      this.setState({ videos }, () => {
        console.log(this.state.videos);
      });
    }
    if (e.value === 'Published Date') {
      const videos = this.state.videos;
      videos.sort(compareDate);
      this.setState({ videos }, () => {
        console.log(this.state.videos);
      });
    }
  }
  searchYT(e) {
    this.setState({ sortKey: undefined });
    const q = e.target.value;
    const params = {
      key: API_KEY,
      q,
      maxResults: 30
    }
    searchYouTube(params, (videos) => {
      const v = this.processVideos(videos);
      this.setState({ videos: v });
    });
  }
  render() {
    const videoComponents = this.state.videos.map((video) => {
      return <CardComponent video={video} />
    });
    return (
      <App>
        {/* <Columns justify="center" size="large"> */}
        <Header fixed={true} size="large">
          <Box flex={true} justify="center" direction="row" margin="medium">
            <SearchInput
              placeHolder="search"
              type="submit"
              width="50%"
              onDOMChange={this.searchYT}
            />
            <Select placeHolder='Sort by'
              options={['', 'Name', 'Published Date']}
              value={this.state.sortKey}
              onChange={this.sortVideos} />
          </Box>
        </Header>
        {/* </Columns> */}
        <Columns>
          <Box className="videoBox" direction="row">
            {videoComponents}
          </Box>
        </Columns>
      </App>
    );
  }
}

export default ReactApp;
