ALTER TABLE `users` ADD `hasPurchased` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripePaymentIntentId` varchar(255);