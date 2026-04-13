CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`refereeId` int NOT NULL,
	`code` varchar(32) NOT NULL,
	`status` enum('pending','purchased','rewarded') NOT NULL DEFAULT 'pending',
	`rewardPaid` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_refereeId_unique` UNIQUE(`refereeId`)
);
--> statement-breakpoint
CREATE TABLE `vaultImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`s3Key` varchar(512) NOT NULL,
	`url` text NOT NULL,
	`name` varchar(255) NOT NULL,
	`size` bigint NOT NULL,
	`mimeType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vaultImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `referralBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);