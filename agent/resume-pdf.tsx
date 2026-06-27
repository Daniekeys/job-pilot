import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import type { Profile } from "@/types";
import type { ResumeContent } from "@/agent/resume-generator";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  name: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  contactLine: { fontSize: 9, color: "#444444", marginBottom: 12 },
  section: { marginBottom: 10 },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
    textTransform: "uppercase",
    borderBottom: "1px solid #cccccc",
    paddingBottom: 2,
  },
  summaryText: { fontSize: 9.5, lineHeight: 1.4 },
  roleRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  roleTitle: { fontSize: 10, fontWeight: 700 },
  roleDates: { fontSize: 9, color: "#444444" },
  bulletRow: { flexDirection: "row", marginTop: 2 },
  bulletDot: { fontSize: 9.5, width: 10 },
  bulletText: { fontSize: 9.5, lineHeight: 1.35, flex: 1 },
  skillsText: { fontSize: 9.5, lineHeight: 1.4 },
  educationLine: { fontSize: 9.5, marginTop: 2 },
});

function ContactLine({ profile }: { profile: Profile }) {
  const parts = [profile.email, profile.phone, profile.location, profile.linkedinUrl, profile.portfolioUrl].filter(
    (part) => part.trim() !== "",
  );
  return <Text style={styles.contactLine}>{parts.join("  •  ")}</Text>;
}

export function ResumeDocument({ profile, content }: { profile: Profile; content: ResumeContent }) {
  const roles = profile.workExperience.filter((role) => role.companyName.trim() !== "" || role.jobTitle.trim() !== "");
  const hasEducation = profile.education.highestDegree.trim() !== "" || profile.education.institutionName.trim() !== "";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{profile.fullName}</Text>
        <ContactLine profile={profile} />

        {content.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Summary</Text>
            <Text style={styles.summaryText}>{content.summary}</Text>
          </View>
        )}

        {profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Skills</Text>
            <Text style={styles.skillsText}>{profile.skills.join(", ")}</Text>
          </View>
        )}

        {roles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Experience</Text>
            {roles.map((role, index) => (
              <View key={`${role.companyName}-${index}`}>
                <View style={styles.roleRow}>
                  <Text style={styles.roleTitle}>
                    {role.jobTitle} — {role.companyName}
                  </Text>
                  <Text style={styles.roleDates}>
                    {role.startDate} – {role.isCurrent ? "Present" : role.endDate}
                  </Text>
                </View>
                {(content.workExperience[index]?.bullets ?? []).map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {hasEducation && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Education</Text>
            <Text style={styles.educationLine}>
              {profile.education.highestDegree}
              {profile.education.fieldOfStudy ? `, ${profile.education.fieldOfStudy}` : ""} — {profile.education.institutionName}
              {profile.education.graduationYear ? `, ${profile.education.graduationYear}` : ""}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
