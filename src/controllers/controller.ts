import { Request, Response } from "express";
import prisma from "../lib/db";
import {
  catchTransactionSchema,
  CatchTransactionSchema,
} from "../lib/schema";

export const catchTransaction = async (req: Request, res: Response) => {
  try {
    if (req.headers["x-bank-key"] !== process.env.WALLET_SECRET) {
      res.status(403).json({
        msg: "Unauthorized request",
        success: false,
      });
      return;
    }

    const { success, error } = catchTransactionSchema.safeParse(req.body);

    if (!success) {
      await prisma.onRampTransaction.updateMany({
        where: {
          transactionId: req.body.transactionId,
          status: "Pending",
        },

        data: {
          status: "Failed",
        },
      });

      return res.json({
        msg: error.message || "Invalid data provided",
        success: false,
      });
    }

    const paymentInformation: CatchTransactionSchema = {
      transactionId: req.body.transactionId,
      user_identifier: req.body.user_identifier,
      amount: req.body.amount,
      provider: req.body.provider,
      status: req.body.status,
    };

    if (paymentInformation.status === "COMPLETED") {
      await prisma.$transaction([
        prisma.account.update({
          where: {
            userId: paymentInformation.user_identifier,
          },

          data: {
            balance: {
              update: {
                amount: {
                  increment: paymentInformation.amount,
                },
              },
            },
          },
        }),

        prisma.onRampTransaction.updateMany({
          where: {
            transactionId: paymentInformation.transactionId,
            status: "Pending",
          },

          data: {
            status: "Success",
          },
        }),
      ]);

      const account = await prisma.account.findUnique({
        where: {
          userId: paymentInformation.user_identifier,
        },
        select: {
          id: true,
          balance: {
            select: {
              amount: true,
            },
          },
        },
      });

      if (account && account.balance) {
        await prisma.balanceHistory.create({
          data: {
            balance: account.balance.amount,
            accountId: account.id,
          },
        });
      }
    } else {
      await prisma.onRampTransaction.updateMany({
        where: {
          transactionId: paymentInformation.transactionId,
          status: "Pending",
        },

        data: {
          status: "Failed",
        },
      });
    }

    res.status(200).json({
      msg: "Transaction captured",
      success: true,
    });
  } catch (error) {
    console.log("CATCH_TRANSACTION_ERROR", error);
    res.status(500).json({
      msg: "Internal server error",
      success: false,
    });
  }
};
