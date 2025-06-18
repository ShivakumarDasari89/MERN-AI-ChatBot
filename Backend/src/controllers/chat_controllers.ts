import { NextFunction, Request, Response } from "express";
import { OpenAIApi, ChatCompletionRequestMessage } from "openai";
import Users from "../models/Users.js";
import { configureOpenAI } from "../config/openai_config.js";



async function makeOpenAIRequest(chats, retries = 3) {
  const config = configureOpenAI();
  const openai = new OpenAIApi(config);

  for (let i = 0; i < retries; i++) {
    try {
      return await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: chats,
      });
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Rate limit hit. Retrying in ${2 ** i} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** i)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error("Exceeded maximum retries due to rate limit.");
}

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await Users.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
    }

    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];

    chats.push({ content: message, role: "user" });
    user.chats.push({ content: message, role: "user" });

    // Send request with retry logic
    const chatResponse = await makeOpenAIRequest(chats);

    user.chats.push(chatResponse.data.choices[0].message);
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.log("Error in OpenAI API call:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('sendChatsToUsersendChatsToUsersendChatsToUserBeeeeeeeeeeeeefffffffffff', req.body);


    //user token check
    const user = await Users.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await Users.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
