import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog';


export const CharacterCreationModal = () => {
  return (
        <RadixDialog.Root>
            <RadixDialog.Trigger asChild>
                <button>Open</button>
            </RadixDialog.Trigger>
            <RadixDialog.Portal>
                <RadixDialog.Overlay />
                <RadixDialog.Content className='rounded-md border-2 p-8 fixed top-[50%] left-[32%]'>
                <RadixDialog.Title className="mb-4"> 
                Edit Character
                </RadixDialog.Title>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-3">
                            <div className="border-b-2">
                            <p className="font-semibold">Basic Information</p>
                                <div className="p-2">
                                    <p>Character Bio</p>
                                </div>
                                
                            </div>
                            <div className="border-b-2">
                                <p className="font-semibold">Attributes</p>
                                <div  className="p-2">
                                    <p>Primary Attributes</p>
                                    <p>Physical Appearance</p>
                                    <p>Occupation</p>
                                    <p>Interests</p>
                                    <p>Skills</p>
                                    <p>Personality</p>
                                    <p>Relationships</p>
                                    <p> + </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-black w-[600px]">
                            



                        </div>
                    </div>
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    )
}
