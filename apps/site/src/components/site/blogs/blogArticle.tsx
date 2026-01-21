import SlideUp from '@/utils/animations/slideUp'
import Link from 'next/link'
import React from 'react'

const BlogArticle = () => {
    return (
        <article>
            <img src="/images/blogs/blog-1.png" alt="img" className="w-100 thumb__img" />
            <div className="first__para">
                <ul className="d-flex flex-wrap gap-4">
                    <li>
                        <img src="/icons/user-black.svg" alt="img" />
                        <span>William Dalton</span>
                    </li>
                    <li>
                        <img src="/icons/comments-black.svg" alt="img" />
                        <span>04 Comments</span>
                    </li>
                    <li>
                        <img src="/icons/clender.svg" alt="img" />
                        <span>12, January 2025</span>
                    </li>
                </ul>
                <SlideUp>
                    <h2 className="t__54">
                        How to increase your business policy for next generation
                    </h2>
                </SlideUp>
                <p>
                    Transfer details Choose the amount you want to send abroad,
                    select how your receiver wants to get the money, and lastly,
                    how you want to pay. You will always see our fees upfront, the
                    final amount you will pay, and the exact amount your receiver
                    will get.
                </p>
                <p>
                    Bushwick post-ironic af fixie, wayfarers kombucha direct trade
                    air plant meditation palo santo asymmetrical salvia blue
                    bottle. 3 wolf moon subway tile fam, cronut cray put a bird on
                    it why is a common is kombucha gentrify available for your
                    next project pok pok.
                </p>
            </div>
            <SlideUp>
                <blockquote>
                    <b>“Bushwick post-ironic af fixie, wayfarers kombucha direct
                        trade air plant meditation palo santo asymmetrical is salvia
                        blue bottle. 3 wolf moon subway tile in the next project in
                        the last season fam.”</b>
                    <p>
                        <span />
                        John Smith
                    </p>
                </blockquote>
            </SlideUp>
            <div className="row img__gallery">
                <div className="col-md-6">
                    <img src="/images/blogs/blog-5.png" alt="img" className="w-100" />
                </div>
                <div className="col-md-6 mt-4 mt-md-0">
                    <div className="position-relative">
                        <img src="/images/blogs/blog-4.png" alt="img" className="w-100" />
                        <a href="https://youtu.be/UVLRVzrOKZk" className="video_icon video-play">
                            <img src="/icons/Frame_20.svg" alt="img" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="second__para">
                <h5 className="t__28">Perfect From Beginning to End</h5>
                <p>
                    Transfer details Choose the amount you want to send abroad,
                    select how your receiver wants to get the money, and lastly,
                    how you want to pay. You will always see our fees upfront, the
                    final amount you will pay, and the exact amount your receiver
                    will get.
                </p>
                <p>
                    Bushwick post-ironic af fixie, wayfarers kombucha direct trade
                    air plant meditation palo santo asymmetrical salvia blue
                    bottle. 3 wolf moon subway tile fam, cronut cray put a bird on
                    it why is a common is kombucha gentrify available for your
                    next project pok pok.
                </p>
            </div>
            <SlideUp className="d-flex justify-content-between flex-wrap align-items-center share__option">
                <div className="d-flex align-items-center gap-4">
                    <h6>Tags:</h6>
                    <button className="active">Design</button>
                    <button>Marketing</button>
                </div>
                <div className="d-flex align-items-center gap-4 mt-3 mt-sm-0">
                    <h6>Share:</h6>
                    <ul className="d-flex justify-content-center gap-3">
                        <li>
                            <Link href="#">
                                <i className="fa-brands fa-facebook-f" />
                            </Link>
                        </li>
                        <li>
                            <Link href="#">
                                <i className="fa-brands fa-pinterest-p" />
                            </Link>
                        </li>
                        <li>
                            <Link href="#">
                                <i className="fa-brands fa-instagram" />
                            </Link>
                        </li>
                        <li>
                            <Link href="#">
                                <i className="fa-brands fa-twitter" />
                            </Link>
                        </li>
                    </ul>
                </div>
            </SlideUp>
        </article>

    )
}

export default BlogArticle