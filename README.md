# BS Shadur Fixur

**BS Shadur Fixur** is a tool designed to help Unity developers convert shader code for VR compatibility and modify shaders to work with Beat Saber's unique alpha + glow system.

## Features:
- **Convert Shader Code:** Automatically modifies Unity shader code to work with VR (Single-Pass Instancing).
- **Blit Shader Support:** Option to include the Blit Shader support in your shader code.
- **Alpha Channel Modification:** Ability to disable the alpha channel (set to 0) to prevent glow effects in Beat Saber.
- **Copy Functionality:** Easily copy the converted shader code to your clipboard.
  
## How It Works:
1. Paste your Unity shader code in the **Input** section.
2. Choose the required options:
    - **Blit Shader:** Adds the necessary macros to handle the Blit Shader.
    - **0 Alpha:** Ensures the alpha channel is set to 0 to avoid glowing in Beat Saber.
3. Press the **Convert** button to generate the converted shader code in the **Output** section.
4. You can then copy the converted shader code with the **Copy** button.

## Useful Resources:
- [Mesh Instancing in Unity](https://docs.unity3d.com/Manual/SinglePassInstancing.html)
- [Making Shaders VR Compatible](https://docs.unity3d.com/2018.1/Documentation/Manual/SinglePassInstancing.html)
- [ShaderToy](https://www.shadertoy.com/)
- [ShaderToy 2 Unity Converter](https://pema.dev/glsl2hlsl/)

## Important Notes:
- **Beat Saber's Render Pipeline:** Beat Saber uses the shader's alpha channel for glow effects. Setting the alpha channel above 1 will instantly turn it white and cause it to glow. This tool is designed to disable the alpha channel (set to 0) to avoid these issues.
- **This tool is mainly intended for beginners and is not recommended for long-term use or production environments.**
