import fs from "fs";
import path from "path";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Head from "next/head";

import remarkGfm from 'remark-gfm';
import Blockquote from "../components/Blockquote";

const Para = (props: any) => (
  <div className="custom para">{ props.children }</div>
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
        remarkGfm,
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
