import { useMemo } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

import {
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
} from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";

import { nip19 } from "nostr-tools";

import { ZAP, REACTION, NOTE } from "@habla/const";
import useSeenOn from "@habla/hooks/useSeenOn";
import NAddr from "@habla/markdown/Naddr";
import { useEvent } from "@habla/nostr/hooks";
import { findTag } from "@habla/tags";
import ArticleTitle from "@habla/components/nostr/ArticleTitle";
import User from "@habla/components/nostr/User";
import Reactions from "@habla/components/nostr/LazyReactions";

export default function Highlight({ event, showHeader = true }) {
  const { ref, inView } = useInView({
    threshold: 0,
  });
  const a = findTag(event, "a");
  const r = findTag(event, "r");
  const seenOn = useSeenOn(event);
  const [kind, pubkey, identifier] = a?.split(":") ?? [];
  const nevent = useMemo(() => {
    return nip19.neventEncode({
      id: event.id,
      author: event.pubkey,
      relays: seenOn,
    });
  }, [event, seenOn]);
  const naddr = useMemo(() => {
    if (kind && pubkey && identifier) {
      return nip19.naddrEncode({
        identifier,
        pubkey,
        kind: Number(kind),
        relays: seenOn,
      });
    }
  }, [kind, pubkey, identifier]);
  return event.content.length < 4200 ? (
    <Card variant="unstyled" ref={ref} my={4}>
      {showHeader && (
        <CardHeader>
          {naddr && (
            <Stack direction="column" spacing="1">
              <ArticleTitle
                naddr={naddr}
                kind={Number(kind)}
                identifier={identifier}
                pubkey={pubkey}
              />
              <User pubkey={pubkey} />
            </Stack>
          )}
          {r && !naddr && !r.startsWith("https://habla.news") && (
            <Link href={r}>
              <Heading fontSize="2xl">{r}</Heading>
            </Link>
          )}
        </CardHeader>
      )}
      <CardBody>
        <Link shallow={true} href={`/e/${nevent}`}>
          <Prose mt={-6} mb={-2}>
            <Text as="blockquote">{event.content}</Text>
          </Prose>
        </Link>
        <User pubkey={event.pubkey} />
      </CardBody>
      <CardFooter>
        <Reactions event={event} kinds={[ZAP, NOTE, REACTION]} live={inView} />
      </CardFooter>
    </Card>
  ) : null;
}
