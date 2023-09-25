import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog';
import { Menu, MenuItem } from './Menu';


export const CharacterCreationModal = () => {
  return (
        <RadixDialog.Root>
            <RadixDialog.Trigger asChild>
                <button>Open</button>
            </RadixDialog.Trigger>
            <RadixDialog.Portal>
                <RadixDialog.Overlay />
                <RadixDialog.Content className='rounded-md border-2 p-8 fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]'>
                <RadixDialog.Title className="mb-4"> 
                Edit Character
                </RadixDialog.Title>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-3">
                            <div className="border-b-2">
                            <p className="font-semibold">Basic Information</p>
                                <div className="p-2 text-sm">
                                    <p>Character Bio</p>
                                </div>
                                
                            </div>
                            <div className="border-b-2">
                                <p className="font-semibold">Attributes</p>
                                <Menu>
                                    <MenuItem>Primary Attributes</MenuItem>
                                    <MenuItem>Physical Appearance</MenuItem>
                                    <MenuItem>Occupation</MenuItem>
                                    <MenuItem>Interests</MenuItem>
                                    <li>Skills</li>
                                    <li>Personality</li>
                                    <li>Relationships</li>
                                </Menu>
                            </div>
                        </div>
                        <div className="border w-[600px]">
                            



                        </div>
                    </div>
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    )
}
