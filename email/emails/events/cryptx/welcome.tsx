import {
  Body,
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

interface CryptXWelcomeEmailProps {
  name: string;
  role: string;
  meetingDate: string;
  meetingTime: string;
  meetingPlatform: string;
  meetingLink: string;
  senderName: string;
  senderPosition: string;
  headerImageUrl: string;
  logoImageUrl: string;
}

export const CryptXWelcomeEmail = ({
  name = '{{name}}',
  role = '{{role}}',
  meetingDate = '{{meetingDate}}',
  meetingTime = '{{meetingTime}}',
  meetingPlatform = 'Google Meet',
  meetingLink = '{{meetingLink}}',
  senderName = '{{senderName}}',
  senderPosition = '{{senderPosition}}',
  headerImageUrl = '/static/header.png',
  logoImageUrl = '/static/logo.png',
}: CryptXWelcomeEmailProps) => {
  const previewText = `Congratulations! You've been selected for CryptX 2.0`;

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
                Congratulations!
              </Heading>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                On behalf of the Executive Committee of ICTS, we are pleased to
                inform you that you have been selected as
              </Text>

              {/* Role Card */}
              <Section className="bg-background p-6 my-4 border border-solid border-border text-center">
                <Text className="text-accent text-2xl font-bold m-0">
                  {role}
                </Text>
              </Section>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                in the Organizing Committee of CryptX 2.0, organized by the
                ICTS, Faculty of Technology, University of Sri Jayewardenepura.
              </Text>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                This is an important milestone, and we look forward to your
                contribution toward delivering a successful and impactful event.
              </Text>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                Please note that an online meeting will be held on{' '}
                <strong className="text-accent">{meetingDate}</strong> at{' '}
                <strong className="text-accent">{meetingTime}</strong> via{' '}
                {meetingPlatform}, and your presence is{' '}
                <strong>mandatory</strong>.
              </Text>

              {/* Meeting Details Box */}
              <Section className="bg-background p-6 my-6 border border-solid border-border">
                <Text className="text-accent text-lg font-bold m-0 mb-4">
                  Meeting Details:
                </Text>
                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Date:</strong> {meetingDate}
                </Text>
                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Time:</strong> {meetingTime}
                </Text>
                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Platform:</strong> {meetingPlatform}
                </Text>
                <Text className="text-white text-[15px] leading-6 m-0 mb-2">
                  <strong>Join Link:</strong>{' '}
                  <Link href={meetingLink} className="text-accent underline">
                    {meetingLink}
                  </Link>
                </Text>
              </Section>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                Kindly ensure that you join the meeting on time, as key
                responsibilities and next steps will be discussed.
              </Text>

              <Text className="text-white text-base leading-7 m-0 mb-4">
                Once again, congratulations and welcome to the team. Let's move
                fast and execute well.
              </Text>

              {/* Signature */}
              <Text className="text-white text-base leading-6 m-0 mt-8 mb-2">
                Best regards,
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
              <Text className="text-white text-sm m-0 mb-6 text-center">
                Faculty of Technology, University of Sri Jayewardenepura
              </Text>

              {/* Social Media Icons */}
              <Section className="mx-auto w-[200px]">
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
                You received this email because you applied to join the CryptX
                2.0 Organizing Committee.
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

export default CryptXWelcomeEmail;
