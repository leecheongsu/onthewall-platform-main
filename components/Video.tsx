import React from 'react';

interface Props {
  video: string;
}

const Video = ({ video }: Props) => {
  return (
    <>
      <video autoPlay loop muted playsInline src={video} width="100%"></video>
    </>
  );
};

export default Video;
