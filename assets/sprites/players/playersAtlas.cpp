// ---------------------------------------
// Sprite definitions for playersAtlas
// Generated with TexturePacker 7.9.0
//
// https://www.codeandweb.com/texturepacker
// ---------------------------------------

#include ""

USING_NS_CC;

namespace TexturePacker
{

void ::addSpriteFramesToCache()
{
    SpriteFrameCache *cache = SpriteFrameCache::getInstance();
    cache->addSpriteFramesWithFile("playersAtlas.plist");
};

void ::removeSpriteFramesFromCache()
{
    SpriteFrameCache *cache = SpriteFrameCache::getInstance();
    cache->removeSpriteFramesFromFile("playersAtlas.plist");
};


// ---------------------
// sprite name constants
// ---------------------
const std::string ::bomber      = "bomber.png";
const std::string ::drednout    = "drednout.png";
const std::string ::interceptor = "interceptor.png";
const std::string ::pulsar      = "pulsar.png";

// ---------------------------------------------------------
// convenience functions returing pointers to Sprite objects
// ---------------------------------------------------------
Sprite* ::createBomberSprite()
{
    return Sprite::createWithSpriteFrameName(bomber);
}

Sprite* ::createDrednoutSprite()
{
    return Sprite::createWithSpriteFrameName(drednout);
}

Sprite* ::createInterceptorSprite()
{
    return Sprite::createWithSpriteFrameName(interceptor);
}

Sprite* ::createPulsarSprite()
{
    return Sprite::createWithSpriteFrameName(pulsar);
}


}; // namespace

