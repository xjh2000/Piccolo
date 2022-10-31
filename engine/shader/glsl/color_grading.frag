#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float lenY      = float(lut_tex_size.y);
    highp float lenX      = float(lut_tex_size.x);
    // 原图像的 RGB
    highp vec4 color       = subpassLoad(in_color).rgba;
    // floor(color.b * lenY) * lenY 先计算出每个 Block 的起始位置
    // color.r * lenY 计算 Block 内的偏移
    highp float u1 = (color.r * lenY + floor(color.b * lenY) * lenY) / lenX;
    highp float u2 = (color.r * lenY + ceil(color.b * lenY) * lenY) / lenX;
    // 由于我们的 LUT 是16 * 256，所以 v 直接就是 g 通道
    highp float v = color.g ;

    // 由于我们 B 通道做了四舍五入，所以需要在两个 Block 之间插值
    highp vec4 color1 = texture(color_grading_lut_texture_sampler, vec2(u1, v));
    highp vec4 color2 = texture(color_grading_lut_texture_sampler, vec2(u2, v));
    out_color = mix(color1, color2, fract(lenY * color.b));
}
