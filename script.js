const input = document.getElementById('inputShader');
const output = document.getElementById('outputShader');
const convertButton = document.getElementById('convertButton');
const copyButton = document.getElementById('copyButton');
const blitCheckbox = document.getElementById('blitCheckbox');
const alphaCheckbox = document.getElementById('alphaCheckbox');

function convertToShader(code) {
    const lines = code.split("\n");
    const output = [];
    let indentLevel = 0;

    const increaseIndent = () => { indentLevel += 1; };
    const decreaseIndent = () => { indentLevel = Math.max(0, indentLevel - 1); };
    const applyIndent = (line) => "    ".repeat(indentLevel) + line;

    for (let line of lines) {
        const trimmed = line.trim();

        if (trimmed.endsWith("}")) {
            output.push(applyIndent(decreaseIndent(trimmed)));
        } else {
            output.push(applyIndent(trimmed));
            if (trimmed.endsWith("{")) increaseIndent();
        }
    }

    return output.join("\n");
}

function insertMacrosIntoStructures(shaderCode) {
    let updatedShaderCode = shaderCode;

    const appdataMacro = `\n    UNITY_VERTEX_INPUT_INSTANCE_ID\n`;
    updatedShaderCode = updatedShaderCode.replace(/struct appdata\s*\{([\s\S]*?)\}/, (match, p1) => {
        return `struct appdata\n{\n${p1}${appdataMacro}}`;
    });

    const v2fMacro = `\n    UNITY_VERTEX_OUTPUT_STEREO\n`;
    updatedShaderCode = updatedShaderCode.replace(/struct v2f\s*\{([\s\S]*?)\}/, (match, p1) => {
        return `struct v2f\n{\n${p1}${v2fMacro}}`;
    });

    return updatedShaderCode;
}

function insertMacrosIntoVertFunction(shaderCode) {
    let updatedShaderCode = shaderCode;

    const vertFunctionRegex = /v2f\s+vert\s*\(appdata\s+v\)\s*{([\s\S]*?)o\.vertex\s*=\s*UnityObjectToClipPos\(v\.vertex\);/;
    const match = shaderCode.match(vertFunctionRegex);
    
    if (match) {
        const beforeInsertion = match[1];
        const macros = `\n            UNITY_SETUP_INSTANCE_ID(v);\n            UNITY_INITIALIZE_OUTPUT(v2f, o);\n            UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);\n`;
        updatedShaderCode = shaderCode.replace(vertFunctionRegex, `v2f vert (appdata v) {\n${beforeInsertion}${macros}o.vertex = UnityObjectToClipPos(v.vertex);`);
    }

    return updatedShaderCode;
}

function convertShaderCode(shaderCode) {
    let updatedShaderCode = shaderCode;

    updatedShaderCode = insertMacrosIntoStructures(updatedShaderCode);
    updatedShaderCode = insertMacrosIntoVertFunction(updatedShaderCode);

    if (!blitCheckbox.checked) {
        updatedShaderCode = updatedShaderCode.replace(/(CGPROGRAM[\s\S]*?)(\n)/, `$1\n            #pragma multi_compile_instancing\n`);
    }

    updatedShaderCode = updatedShaderCode.replace(/(half4\s+\w+\s*=\s*)tex2D\(_MainTex,\s*(i\.uv)\)/g, `$1UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, UnityStereoTransformScreenSpaceTex($2))`);
    updatedShaderCode = updatedShaderCode.replace(/half4/g, 'float4');

    if (alphaCheckbox.checked) {
        updatedShaderCode = updatedShaderCode.replace(/(Pass\s*{)/, `$1\n            ColorMask RGB\n`);
    }

    if (blitCheckbox.checked) {
        updatedShaderCode = updatedShaderCode.replace(/(float4\s+\w+\s*=\s*UNITY_SAMPLE_SCREENSPACE_TEXTURE\(_MainTex,\s*UnityStereoTransformScreenSpaceTex\(i\.uv\)\);)/g, `            UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);\n            float4 texColor = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, UnityStereoTransformScreenSpaceTex(i.uv));\n            float4 color = lerp(texColor, float4(1, 1, 1, 1), _Amount);\n            return color;\n`);
    } else {
        updatedShaderCode = updatedShaderCode.replace(/(float4\s+\w+\s*=\s*UNITY_SAMPLE_SCREENSPACE_TEXTURE\(_MainTex,\s*UnityStereoTransformScreenSpaceTex\(i\.uv\)\);)/g, `            float4 texColor = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, UnityStereoTransformScreenSpaceTex(i.uv));\n            return texColor;\n`);
    }

    if (/float4\s+frag\s*\(v2f\s+i\)\s*:\s*SV_Target\s*{[\s\S]*?}/.test(updatedShaderCode)) {
        if (blitCheckbox.checked) {
            updatedShaderCode = updatedShaderCode.replace(/(float4\s+frag\s*\(v2f\s+i\)\s*:\s*SV_Target\s*{[\s\S]*?)(\n\s*})/, `            UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);\n            float4 texColor = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, UnityStereoTransformScreenSpaceTex(i.uv));\n            float4 color = lerp(texColor, float4(1, 1, 1, 1), _Amount);\n            return color;\n$2`);
        } else {
            updatedShaderCode = updatedShaderCode.replace(/(float4\s+frag\s*\(v2f\s+i\)\s*:\s*SV_Target\s*{[\s\S]*?)(\n\s*})/, `            float4 texColor = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, UnityStereoTransformScreenSpaceTex(i.uv));\n            return texColor;\n$2`);
        }
    }

    return updatedShaderCode;
}

convertButton.addEventListener('click', () => {
    const shaderCode = input.value;
    const convertedCode = convertShaderCode(shaderCode);
    output.value = convertedCode;
});

copyButton.addEventListener('click', () => {
    output.select();
    document.execCommand('copy');

    copyButton.textContent = 'COPIED';
    copyButton.classList.add('copied');

    setTimeout(() => {
        copyButton.textContent = 'Copy';
        copyButton.classList.remove('copied');
    }, 5000);
});
