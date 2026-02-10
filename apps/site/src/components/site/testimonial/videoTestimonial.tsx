"use client";
import Image from "next/image";
import { useState } from "react";
// @ts-ignore - react-modal-video types not available
import ModalVideo from "react-modal-video";
const VideoTestimonial = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <div className="video">
        <h1 className="title text-center mb-5">
          Pourquoi venir à CoworKing Café ? <br />
          Pour ça !
        </h1>

        <div className="position-relative">
          <Image
            src="/images/testimonail/anticafé-strasbourg.webp"
            alt="Vidéo présentation Anticafé CoworKing Café Strasbourg"
            width={1200}
            height={675}
            loading="lazy"
            quality={85}
            className="video_thumb"
          />
          <div onClick={() => setOpen(true)} className="video_icon video-play">
            <Image
              src="/images/testimonail/Frame_20.svg"
              alt="bouton play"
              width={80}
              height={80}
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="cHfYLa7XE_0"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default VideoTestimonial;
