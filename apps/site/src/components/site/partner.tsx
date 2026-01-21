import React from 'react';

interface PartnerProps {
    data: string[];
    className?: string;
}

const Partner = ({data, className = ''}: PartnerProps) => {
    return (
        <div className={`partner ${className}`}>
            <div className="partner__wapper">
                <div className="partner__content">
                    {data.map((logoSrc, index) => (
                        <div className="slide" key={index}>
                            <img src={logoSrc} alt={`Partner logo ${index + 1}`} className="partner__logo" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Partner;