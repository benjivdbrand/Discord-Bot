import discord
from discord.ext import commands
import os

bot = commands.Bot(command_prefix='$')

@bot.command()
async def join(ctx):
    await ctx.send('Hello!')
    channel = ctx.author.voice.channel
    await channel.connect()

@bot.command()
async def leave(ctx):
    await ctx.voice_client.disconnect()

bot.run(os.getenv('TOKEN'))