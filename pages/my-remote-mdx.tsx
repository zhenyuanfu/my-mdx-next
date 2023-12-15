import fs from "fs";
import path from "path";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Head from "next/head";

import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkSmartypants from 'remark-smartypants';
import { rehypeCodeBlocks } from '../plugins/rehype/rehypeCodeBlocks';
import { rehypeLayouts } from '../plugins/rehype/rehypeLayouts';
import { rehypeListRoles } from '../plugins/rehype/rehypeListRoles';
import { rehypeMdxExtractExamples } from '../plugins/rehype/rehypeMdxExtractExamples';
import { rehypeMdxInjectEndpoint } from '../plugins/rehype/rehypeMdxInjectEndpoint';
import rehypeMdxRemoveUnknownJsx from '../plugins/rehype/rehypeMdxRemoveUnknownJsx';
import { rehypeRawComponents } from '../plugins/rehype/rehypeRawComponents';
import { rehypeSyntaxHighlighting } from '../plugins/rehype/rehypeSyntaxHighlighting';
import { rehypeZoomImages } from '../plugins/rehype/rehypeZoomImages';
import { remarkFrames } from '../plugins/remark/remarkFrames';
import { remarkMdxInjectRequire } from '../plugins/remark/remarkMdxInjectRequire';
import { remarkMdxInjectSnippets } from '../plugins/remark/remarkMdxInjectSnippets';
import { remarkMdxRemoveJs } from '../plugins/remark/remarkMdxRemoveJs/index.js';
import { remarkMdxWrapDangerouslySetInnerHtml } from '../plugins/remark/remarkMdxWrapDangerouslySetInnerHtml';
import { remarkRemoveImports } from '../plugins/remark/remarkRemoveImports';
import { remarkTableOfContents } from '../plugins/remark/remarkTableOfContents';

import Blockquote from "../components/Blockquote";

const Para = ({ children }: { children: any }) => (
  <div className="custom para">{ children }</div>
)

const components = { Blockquote, p: Para };

interface Props {
  mdxSource: MDXRemoteSerializeResult;
}

export default function RemoteMdxPage({ mdxSource, ...props }: Props) {
  console.log("props==", props, mdxSource);
  return (
    <>
      <Head>
        <title>{(mdxSource as any)?.frontmatter?.title || ''}</title>
        <meta
          name="description"
          content={(mdxSource as any)?.frontmatter?.description}
        />
      </Head>
      <MDXRemote {...mdxSource} components={components} />
    </>
  );
}

export async function getStaticProps() {
  const content = fs.readFileSync(path.resolve("./mdxs", "test.mdx"), "utf8");
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [
        // 插件的传参方式
        // [remarkMdxInjectRequire, data?.subdomain],
        // [remarkMdxInjectSnippets, data?.snippetTreeMap],
        remarkGfm,
        remarkMdxRemoveJs,
        remarkFrames,
      ],
      rehypePlugins: [
      ],
      format: "mdx",
      useDynamicImport: true,
      // ...mdxOptions,
    },
    parseFrontmatter: true,
  });
  return { props: { mdxSource } };
}
