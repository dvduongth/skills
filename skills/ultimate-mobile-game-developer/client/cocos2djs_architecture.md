# Cocos2d-JS Architecture (3.x) – Mobile Reference

## Overview
- CC2D-JS 3.x scene/Layer/Node rendering model.
- Organize code into Core, Modules, UI, and Assets.
- ES5-style, no ES6 modules for compatibility.

## Structure & Patterns
- SceneFactory, SceneMgr, BaseScene, and BaseGUI.
- Sprite batching and texture atlas strategy.
- Memory pools and object reuse.

## Constraints
1. No ES6 modules.
2. No template literals (for JSB compatibility).
