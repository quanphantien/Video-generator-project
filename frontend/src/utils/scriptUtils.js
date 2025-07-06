// Utility functions for script parsing and scene extraction

export const parseScriptToScenes = (scriptText) => {
  if (!scriptText || typeof scriptText !== 'string') {
    return [];
  }

  // Split by Scene markers
  const sceneBlocks = scriptText.split(/Scene \d+:/i).filter(block => block.trim());
  
  const scenes = sceneBlocks.map((block, index) => {
    const lines = block.trim().split('\n').filter(line => line.trim());
    
    let text = '';
    let prompt = '';
    let tts = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Text:')) {
        text = trimmedLine.substring(5).trim();
      } else if (trimmedLine.startsWith('Prompt:')) {
        prompt = trimmedLine.substring(7).trim();
      } else if (trimmedLine.startsWith('TTS:')) {
        tts = trimmedLine.substring(4).trim();
      } else if (!trimmedLine.startsWith('Text:') && !trimmedLine.startsWith('Prompt:') && !trimmedLine.startsWith('TTS:') && trimmedLine) {
        // If no explicit label, treat as text
        if (!text) text = trimmedLine;
      }
    });
    
    return {
      sceneNumber: index + 1,
      text: text || `Scene ${index + 1} content`,
      prompt: prompt || text || `Scene ${index + 1} visual`,
      tts: tts || text || `Scene ${index + 1} content`
    };
  });
  
  return scenes;
};

export const validateScenes = (scenes) => {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error('Không có scene nào được tìm thấy trong script');
  }
  
  const invalidScenes = scenes.filter(scene => !scene.text && !scene.tts);
  if (invalidScenes.length > 0) {
    throw new Error(`Scene ${invalidScenes.map(s => s.sceneNumber).join(', ')} không có nội dung text`);
  }
  
  return true;
};

export const formatScriptForVideo = (scenes) => {
  return scenes.map(scene => 
    `Scene ${scene.sceneNumber}: ${scene.text}`
  ).join('\n');
};
