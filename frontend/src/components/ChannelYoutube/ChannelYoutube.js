import React from 'react';
import ConnectYoutube from '../ConnectYoutube/ConnectYoutube';
import VidListYoutube from '../VidListYoutube/VidListYoutube';

const ChannelYoutube = () => {
    return (
        <div >
            <h1 className="text-3xl font-bold text-purple-600">Channel Youtube</h1>
            <div className="mb-6">
                <ConnectYoutube />
            </div>
            <VidListYoutube />
        </div>
    );
};

export default ChannelYoutube;