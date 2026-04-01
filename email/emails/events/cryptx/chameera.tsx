import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

export interface CryptXChameeraEmailProps {
  // Recipient
  name: string;
  // Session 1 — Workshop (Guest Speaker)
  workshopDate: string;
  workshopTime: string;
  workshopPlatform: string;
  workshopLink: string;
  workshopCalendarUrl: string;
  // Session 2 — Judging Panel
  judgingDate: string;
  judgingTime: string;
  judgingVenue: string;
  judgingCalendarUrl: string;
  // Sender
  senderName: string;
  senderPosition: string;
  // Email routing (used by send.ts / config; not rendered inline)
  to: string;
  cc?: string[];
  bcc?: string[];
  // Assets
  headerImageUrl: string;
  logoImageUrl: string;
  replyToEmail?: string;
  proposalPdfUrl?: string;
}

export const CryptXChameeraEmail = ({
  name = '{{name}}',
  workshopDate = 'Wednesday, April 2nd',
  workshopTime = '7:00 PM – 9:00 PM',
  workshopPlatform = 'Google Meet',
  workshopLink = '{{workshopLink}}',
  workshopCalendarUrl = '#',
  judgingDate = 'Friday, April 4th',
  judgingTime = '2:00 PM – 5:00 PM',
  judgingVenue = '{{judgingVenue}}',
  judgingCalendarUrl = '#',
  senderName = '{{senderName}}',
  senderPosition = '{{senderPosition}}',
  headerImageUrl = '/static/events/cryptx/assets/header.png',
  logoImageUrl = '/static/events/cryptx/assets/logo.png',
  replyToEmail = 'cryptx.icts.usj@gmail.com',
  proposalPdfUrl,
}: CryptXChameeraEmailProps) => {
  const previewText = `You're Invited — CryptX 2.0 Workshop & Judging Panel`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                accent: '#F54E00',
                background: '#13120A',
                foreground: '#201E18',
                border: '#292821',
              },
            },
          },
        }}
      >
        <Body className="bg-background font-sans py-10">
          <Container className="bg-foreground mx-auto p-0 max-w-[600px] border border-solid border-border">
            {/* Header Image - 600px x 200px */}
            <Section className="p-0">
              <Img
                src={headerImageUrl}
                width="600"
                height="200"
                alt="CryptX 2.0 Event Banner"
                className="block w-full h-auto"
              />
            </Section>

            {/* Email Body */}
            <Section className="px-12 py-10">
              <Text className="text-white text-base leading-7 m-0 mb-4">
                Dear <strong className="text-accent">{name}</strong>,
              </Text>

              <Heading className="text-accent tracking-tight text-3xl font-semibold text-center m-0 mb-6">
                You're Invited!
              </Heading>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                On behalf of the CryptX 2.0 Organizing committee, we are truly
                honoured to extend this invitation to you to be a valued part of{' '}
                <Link
                  href="https://cryptx.lk"
                  className="text-accent no-underline font-semibold"
                >
                  CryptX 2.0
                </Link>{' '}
                — our flagship event organized by the ICTS, Faculty of
                Technology, University of Sri Jayewardenepura.
              </Text>

              <Text className="text-white text-base leading-7 m-0 mb-6">
                We would be delighted to have you contribute your expertise
                across two key engagements:
              </Text>

              {/* ── Session 1: Workshop (Guest Speaker) ── */}
              <Section className="bg-background border border-solid border-border p-6 my-4">
                {/* Badge label */}
                <Text className="text-background text-xs font-bold uppercase tracking-widest bg-accent m-0 mb-4 px-3 py-1 inline-block">
                  Session 1 — Guest Speaker
                </Text>

                <Text className="text-white text-xl font-bold m-0 mb-3">
                  Online Workshop
                </Text>

                <Hr className="border-border opacity-30 my-3" />

                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Date:</strong>{' '}
                  <span className="text-accent">{workshopDate}</span>
                </Text>

                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Time:</strong>{' '}
                  <span className="text-accent">{workshopTime}</span>
                </Text>

                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Platform:</strong> {workshopPlatform}{' '}
                  <span className="text-[#888888]">(Online)</span>
                </Text>

                {/* Add to Calendar — Workshop */}
                <Button
                  href={workshopCalendarUrl}
                  style={{
                    color: '#F54E00',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    border: '1px solid #F54E00',
                    padding: '8px 12px',
                    display: 'inline-block',
                    backgroundColor: 'transparent',
                  }}
                >
                  + Add to Google Calendar
                </Button>
              </Section>

              {/* ── Session 2: Judging Panel ── */}
              <Section className="bg-background border border-solid border-border p-6 my-4">
                {/* Badge label */}
                <Text className="text-background text-xs font-bold uppercase tracking-widest bg-accent m-0 mb-4 px-3 py-1 inline-block">
                  Session 2 — Judge
                </Text>

                <Text className="text-white text-xl font-bold m-0 mb-3">
                  Judging Panel
                </Text>

                <Hr className="border-border opacity-30 my-3" />

                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Date:</strong>{' '}
                  <span className="text-accent">{judgingDate}</span>
                </Text>

                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Time:</strong>{' '}
                  <span className="text-accent">{judgingTime}</span>
                </Text>

                <Text className="text-white text-[15px] leading-6 m-0 mb-4">
                  <strong>Venue:</strong>{' '}
                  <span className="text-accent">{judgingVenue}</span>
                </Text>

                {/* Add to Calendar — Judging Panel */}
                <Button
                  href={judgingCalendarUrl}
                  style={{
                    color: '#F54E00',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    border: '1px solid #F54E00',
                    padding: '8px 12px',
                    display: 'inline-block',
                    backgroundColor: 'transparent',
                  }}
                >
                  + Add to Google Calendar
                </Button>
              </Section>

              <Text className="text-white text-base leading-7 m-0 mt-6 mb-4">
                Your participation would add tremendous value to our
                participants and the event as a whole. We deeply appreciate your
                time and willingness to share your knowledge and insights with
                the next generation of technology enthusiasts.
              </Text>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                Please feel free to reach out if you have any questions or
                require further information. We would be happy to accommodate
                any specific requirements you may have.
              </Text>

              {/* Proposal PDF link */}
              {proposalPdfUrl && (
                <Text className="text-white text-base leading-7 m-0 mb-6">
                  For more details about the event, please refer to our{' '}
                  <Link
                    href={proposalPdfUrl}
                    className="text-accent font-semibold no-underline"
                  >
                    event proposal
                  </Link>
                  .
                </Text>
              )}

              <Text className="text-white text-base leading-7 m-0 mb-4">
                We look forward to your positive response and to welcoming you
                to CryptX 2.0.
              </Text>

              {/* Signature */}
              <Text className="text-white text-base leading-6 m-0 mt-8 mb-2">
                Warm regards,
              </Text>
              <Text className="text-accent text-base font-bold m-0 mb-1">
                {senderName}
              </Text>
              <Text className="text-white text-sm m-0 mb-1">
                {senderPosition}
              </Text>
              <Text className="text-[#888888] text-sm m-0 mb-0.5">
                ICTS | Faculty of Technology
              </Text>
              <Text className="text-[#888888] text-sm m-0">
                University of Sri Jayewardenepura
              </Text>
            </Section>

            <Hr className="border-border opacity-20 m-0" />

            {/* Footer */}
            <Section className="bg-background px-12 py-8 text-center">
              {/* Logo - 120px width */}
              <Img
                src={logoImageUrl}
                width="120"
                alt="CryptX Logo"
                className="mx-auto mb-4"
              />

              <Text className="text-accent text-lg font-bold m-0 mb-1 text-center">
                CryptX by ICTS
              </Text>
              <Text className="text-white text-sm m-0 mb-1 text-center">
                Faculty of Technology, University of Sri Jayewardenepura
              </Text>
              <Link
                href="https://cryptx.lk"
                className="text-accent text-sm no-underline mb-6 inline-block"
              >
                cryptx.lk
              </Link>

              {/* Social Media Icons */}
              <Section className="mx-auto w-[200px] mt-4">
                <Row>
                  <Column className="px-2 text-center">
                    <Link href="https://www.facebook.com/icts.usj">
                      <Img
                        src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                        width="24"
                        height="24"
                        alt="Facebook"
                        className="brightness-0 invert"
                      />
                    </Link>
                  </Column>
                  <Column className="px-2 text-center">
                    <Link href="https://www.linkedin.com/company/icts-usj/">
                      <Img
                        src="https://cdn-icons-png.flaticon.com/512/733/733561.png"
                        width="24"
                        height="24"
                        alt="LinkedIn"
                        className="brightness-0 invert"
                      />
                    </Link>
                  </Column>
                  <Column className="px-2 text-center">
                    <Link href="https://www.instagram.com/icts.usj/">
                      <Img
                        src="https://cdn-icons-png.flaticon.com/512/733/733558.png"
                        width="24"
                        height="24"
                        alt="Instagram"
                        className="brightness-0 invert"
                      />
                    </Link>
                  </Column>
                  <Column className="px-2 text-center">
                    <Link href="https://www.tiktok.com/@icts.usj">
                      <Img
                        src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
                        width="24"
                        height="24"
                        alt="TikTok"
                        className="brightness-0 invert"
                      />
                    </Link>
                  </Column>
                </Row>
              </Section>

              <Hr className="border-border opacity-20 my-6" />

              <Text className="text-[#666666] text-xs leading-5 m-0 mb-2 text-center">
                This invitation was sent on behalf of the ICTS Executive
                Committee for CryptX 2.0.
              </Text>
              <Text className="text-[#666666] text-xs m-0 text-center">
                © {new Date().getFullYear()} ICTS, Faculty of Technology,
                University of Sri Jayewardenepura. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default CryptXChameeraEmail;
