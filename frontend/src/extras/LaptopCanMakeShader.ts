import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class LaptopCanMakeShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("time", 0);
        this.addUniform("ratio", 0);
        this.addTexture("image", DefaultTextures.getWhite(this.renderer))

        this.addSampler("mySampler")

        this.needsTransform = true;
        this.needsCamera = true;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
    @location(1) normal : vec3f,
    @builtin(position) position : vec4f
  
}
struct GBufferOutput {
  @location(0) color : vec4f,
  @location(1) normal : vec4f,
    @location(2) mra : vec4f,
   
}

${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    output.uv0 =aUV0;
   
    output.normal =model.normalMatrix *aNormal;
    
    return output;
}

@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f) -> GBufferOutput
{
    var output : GBufferOutput;
  let uv = uv0*vec2(1.0,1./uniforms.ratio);
 
    let sx1 =step(uv0.x,0.53);
    let sx2 =1.0-step(uv0.x,0.49);
    
    let sy1 =step(uv0.y,0.19);
    let sy2 =1.0-step(uv0.y,0.08);
    let t =sin(uniforms.time*3.1415);
    let s = sx1*sx2*sy1*sy2*step(0.0,t)*0.5;
    
    output.color = textureSample(image, mySampler,uv );
    output.color = output.color +vec4(s,s,s,0); 
    output.normal =vec4(normalize(normal)*0.5+0.5,1.0);
    output.mra =vec4(0.5,0.3,0.5,0.5);
 

    return output;
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}
