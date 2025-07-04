

from dto.image_dto import Model


voices = {
    'EN_VOICE_MALE' : "en-GB-RyanNeural" ,
    'EN_VOICE_FEMALE' : "en-GB-SoniaNeural",
    'VN_VOICE_MALE' : "vi-VN-NamMinhNeural",
    'VN_VOICE_FEMALE' : "vi-VN-HoaiMyNeural",
    'VN_GOOGLE_VOICE' : "VN_GOOGLE_VOICE" , 
    'EN_GOOGLE_VOICE' : "EN_GOOGLE_VOICE" , 

}

models = [
    Model(name="Gemini" , code = "GE" , thumbnailUrl="https://res.cloudinary.com/deb1zkv9x/image/upload/v1751622366/gemini_onuxly.png") , 
    Model(name="Replicate"  , code = "RE", thumbnailUrl="https://res.cloudinary.com/deb1zkv9x/image/upload/v1751622366/replicate_dil8tc.jpg") , 
    Model(name="Stable Diffusion" , code= "SD", thumbnailUrl="https://res.cloudinary.com/deb1zkv9x/image/upload/v1751622366/stability_s9hhsa.png") , 
]



