import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Permissions } from "discord.js";
import { getWarn } from "../utils/data";

export const data = new SlashCommandBuilder()
	.setName("warn")
	.setDescription("유저에게 경고를 지급 하실 수 있습니다.")
	.addUserOption((option) => option.setName("members").setDescription("경고를 지급할 멤버를 선택해 주세요.").setRequired(true))
	.addStringOption((option) => option.setName("reason").setDescription("경고 사유룰 적어주세요.").setRequired(false));
export async function execute(interaction) {
	let target = interaction.options.getUser("members");
	let reason = interaction.options.getString("reason");
	const member = interaction.guild.members.cache.get(target.id);
	let errEmbed = new MessageEmbed();

	if (!interaction.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS])) {
		errEmbed
			.setTitle("<a:no_marking:923823041564278805> **Error!**")
			.setDescription("관리자 전용 명령어입니다.")
			.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.user.avatarURL()
			})
			.setColor("BLUE");

		interaction.reply({ embeds: [errEmbed], ephemeral: true });
		return;
	}

	if (member.permissions.has([Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS])) {
		errEmbed
			.setTitle("<a:no_marking:923823041564278805> **Error!**")
			.setDescription("관리자를 경고처리 하실 수 없습니다.")
			.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.user.avatarURL()
			})
			.setColor("BLUE");
		interaction.reply({ embeds: [errEmbed], ephemeral: true });
		return;
	}

	if (reason === "") {
		reason = "undefined";
	}

	let warn_count = getWarn(interaction.guild, target);
	if (warn_count++ === 3) {
		const banEmbed = new MessageEmbed()
			.setTitle("<a:checking:923822230255845396> **Done!**")
			.setDescription(`<@!${target.id}>님이 회 경고로 영구차단 처리 되셨습니다. reason: \`${reason}\``)
			.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.user.avatarURL()
			})
			.setColor("BLUE");

		await interaction.reply({ embeds: [banEmbed] });

		member.ban();
		return await target.send(`당신은 ${interaction.guild.name} 서버에서 영구차단 조치가 되었습니다.!\n\`\`\`diff\nReason\n+: ${reason}\`\`\``);
	}

	const embed = new MessageEmbed()
		.setTitle("<a:checking:923822230255845396> **Done!**")
		.setDescription(`<@!${target.id}>님에게 경고 처리를 하였습니다.`)
		.addField("**처리자**", `<@!${interaction.user.id}>`, true)
		.addField("**경고사유**", `\`${reason}\``, true)
		.addField("**누적경고 수**", `${getWarn(interaction.guild, target)}회`, true)
		.setFooter({
			text: interaction.user.tag,
			iconURL: interaction.user.avatarURL()
		})
		.setColor("BLUE");

	interaction.reply({ embeds: [embed] });

	await target.send(`You're banned from ${interaction.guild.name}!\n\`\`\`diff\nReason\n+: ${reason}\`\`\``);
}
